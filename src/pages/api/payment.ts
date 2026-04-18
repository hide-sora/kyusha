import type { APIRoute } from 'astro';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { generateTicketCode } from '../../lib/ticket';
import { generateTicketEmailHtml } from '../../lib/ticketEmail';

const ADVANCE_CAR_STOCK = 93;
const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';

async function getPbToken(): Promise<string> {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: import.meta.env.PB_SUPERUSER_EMAIL,
      password: import.meta.env.PB_SUPERUSER_PASSWORD,
    }),
  });
  const data = await res.json() as { token?: string };
  return data.token || '';
}

const TICKET_LABELS: Record<string, string> = {
  advance_car: '展示車両チケット（前売り）',
  advance_general: '一般入場（前売り）',
  day_general: '一般入場（当日）',
  test_1yen: 'テスト決済（1円）',
};

const VALID_PRICES: Record<string, number> = {
  advance_car: 8000,
  advance_general: 1500,
  day_general: 2500,
  test_1yen: 1,
};

// 前売 → 当日の切替: 2026-04-26 00:00 JST
const PRESALE_CUTOFF_MS = Date.parse('2026-04-26T00:00:00+09:00');

export const POST: APIRoute = async ({ request }) => {
  const accessToken = import.meta.env.SQUARE_ACCESS_TOKEN;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ success: false, error: '決済設定が未完了です' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: {
    sourceId?: string;
    ticketType?: string;
    quantity?: number;
    childQuantity?: number;
    name?: string;
    email?: string;
    amount?: number;
    idempotencyKey?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'リクエストが不正です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { sourceId, ticketType, quantity = 1, childQuantity = 0, name, email, amount, idempotencyKey } = body;

  if (typeof sourceId !== 'string' || typeof ticketType !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    return new Response(
      JSON.stringify({ success: false, error: '必須項目が不足しています' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (!sourceId || !ticketType || !name.trim() || !email.trim()) {
    return new Response(
      JSON.stringify({ success: false, error: '必須項目が不足しています' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  // 金額の整合性チェック（サーバー側で再計算）
  const unitPrice = VALID_PRICES[ticketType];
  if (!unitPrice) {
    return new Response(
      JSON.stringify({ success: false, error: '無効なチケット種別です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) ||
      typeof childQuantity !== 'number' || !Number.isInteger(childQuantity)) {
    return new Response(
      JSON.stringify({ success: false, error: '枚数が不正です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const safeChildQuantity = Math.max(0, Math.min(10, childQuantity));
  const validAmount = unitPrice * Math.max(1, Math.min(10, quantity));

  if (amount !== validAmount) {
    return new Response(
      JSON.stringify({ success: false, error: '金額が一致しません' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 前売 → 当日の期限チェック（4/26 0:00 JST 以降は前売券を拒否・当日券を強制）
  const now = Date.now();
  if (ticketType === 'advance_general' && now >= PRESALE_CUTOFF_MS) {
    return new Response(
      JSON.stringify({ success: false, error: '前売券の販売は終了しました。当日券をご購入ください。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (ticketType === 'day_general' && now < PRESALE_CUTOFF_MS) {
    return new Response(
      JSON.stringify({ success: false, error: '現在は前売券販売期間です。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const pbToken = await getPbToken();

  // 展示車両チケットの在庫チェック
  if (ticketType === 'advance_car') {
    try {
      const stockRes = await fetch(
        `${PB_URL}/api/collections/ticket_purchases/records?filter=ticket_type%3D%22advance_car%22&perPage=1`,
        { headers: { 'Authorization': pbToken } }
      );
      const stockData = await stockRes.json() as { totalItems?: number };
      if ((stockData.totalItems ?? 0) >= ADVANCE_CAR_STOCK) {
        return new Response(
          JSON.stringify({ success: false, error: '展示車両チケットは完売しました' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: '在庫確認に失敗しました。しばらくしてからお試しください。' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const client = new SquareClient({
    token: accessToken,
    environment:
      import.meta.env.PUBLIC_SQUARE_ENV === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });

  // クライアントから渡された idempotencyKey を優先（リトライ時の二重決済を Square 側で防止）
  const squareIdempotencyKey = (typeof idempotencyKey === 'string' && idempotencyKey.length >= 16 && idempotencyKey.length <= 45)
    ? idempotencyKey
    : randomUUID();

  try {
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: squareIdempotencyKey,
      amountMoney: {
        amount: BigInt(validAmount),
        currency: 'JPY',
      },
      note: `旧車サミット2026 - ${TICKET_LABELS[ticketType]} × ${quantity}`,
      buyerEmailAddress: normalizedEmail,
      billingAddress: {
        firstName: normalizedName,
      },
    });

    if (response.payment?.status === 'COMPLETED') {
      const orderId = response.payment.id ?? '';

      // チケットコードを DB で一意になるまでリトライ生成（最大5回）
      let ticketCode = '';
      for (let i = 0; i < 5; i++) {
        const candidate = generateTicketCode();
        try {
          const checkRes = await fetch(
            `${PB_URL}/api/collections/ticket_purchases/records?filter=ticket_code%3D%22${encodeURIComponent(candidate)}%22&perPage=1`,
            { headers: { Authorization: pbToken } }
          );
          const checkData = await checkRes.json() as { totalItems?: number };
          if ((checkData.totalItems ?? 0) === 0) {
            ticketCode = candidate;
            break;
          }
        } catch (e) {
          console.error('[PB] ticket_code uniqueness check error:', e);
          ticketCode = candidate;
          break;
        }
      }
      if (!ticketCode) ticketCode = generateTicketCode();

      // PocketBase に購入記録を保存（await — 失敗時は決済済みだがログを残す）
      try {
        const pbRes = await fetch(`${PB_URL}/api/collections/ticket_purchases/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': pbToken },
          body: JSON.stringify({
            ticket_type: ticketType,
            quantity,
            child_quantity: safeChildQuantity,
            payment_id: orderId,
            ticket_code: ticketCode,
            buyer_name: normalizedName,
            buyer_email: normalizedEmail,
          }),
        });
        if (!pbRes.ok) {
          const errText = await pbRes.text().catch(() => '');
          console.error('[PB] record save failed:', pbRes.status, errText, 'orderId:', orderId, 'ticketCode:', ticketCode);
        }
      } catch (e) {
        console.error('[PB] record error:', e, 'orderId:', orderId, 'ticketCode:', ticketCode);
      }

      // n8n webhook でメール送信（fire-and-forget — 決済は成功済み、失敗してもチケットは localStorage と PB に残る）
      const n8nUrl = import.meta.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        const emailHtml = generateTicketEmailHtml({
          ticketLabel: TICKET_LABELS[ticketType],
          name: normalizedName,
          quantity,
          childQuantity: safeChildQuantity,
          ticketCode,
          orderId,
          total: validAmount,
        });

        // n8n がダウンしても決済フローを止めないよう 5秒タイムアウト
        const n8nController = new AbortController();
        const n8nTimeout = setTimeout(() => n8nController.abort(), 5000);
        fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            name: normalizedName,
            ticketType,
            ticketLabel: TICKET_LABELS[ticketType],
            quantity,
            childQuantity: safeChildQuantity,
            total: validAmount,
            orderId,
            ticketCode,
            qrImageUrl: `https://classic-car-2026.com/api/qr/${ticketCode}.png`,
            verifyUrl: `https://classic-car-2026.com/verify?code=${ticketCode}`,
            emailHtml,
            emailSubject: `【旧車サミット2026】電子チケット（${TICKET_LABELS[ticketType]}）`,
          }),
          signal: n8nController.signal,
        })
          .catch(e => console.error('[n8n] webhook error:', e, 'orderId:', orderId))
          .finally(() => clearTimeout(n8nTimeout));

        // 管理者宛通知（fire-and-forget、5秒タイムアウト）
        const adminController = new AbortController();
        const adminTimeout = setTimeout(() => adminController.abort(), 5000);
        const adminHtml = `<!DOCTYPE html>
<html><body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f4f4;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;">
    <p style="margin:0 0 8px;color:#c9a84c;font-size:11px;letter-spacing:2px;font-weight:700;">KYUSHA SUMMIT 2026 / ADMIN</p>
    <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">チケット購入がありました</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="color:#666;padding:6px 0;width:110px;">お名前</td><td style="font-weight:700;">${normalizedName} 様</td></tr>
      <tr><td style="color:#666;padding:6px 0;">メール</td><td>${normalizedEmail}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">券種</td><td>${TICKET_LABELS[ticketType]}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">大人</td><td>${quantity} 名</td></tr>
      <tr><td style="color:#666;padding:6px 0;">小人</td><td>${safeChildQuantity} 名</td></tr>
      <tr><td style="color:#666;padding:6px 0;">合計金額</td><td style="font-weight:800;">¥${validAmount.toLocaleString()}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">チケットNo</td><td style="font-family:monospace;">${ticketCode}</td></tr>
      <tr><td style="color:#666;padding:6px 0;">注文ID</td><td style="font-family:monospace;font-size:11px;">${orderId}</td></tr>
    </table>
  </div>
</body></html>`;
        fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'mitodouraku@gmail.com',
            name: '水戸道楽TV 運営',
            ticketType,
            ticketLabel: TICKET_LABELS[ticketType],
            quantity,
            childQuantity: safeChildQuantity,
            total: validAmount,
            orderId,
            ticketCode,
            buyerName: normalizedName,
            buyerEmail: normalizedEmail,
            emailHtml: adminHtml,
            emailSubject: `【旧車サミット2026】購入通知: ${normalizedName}様 / ${TICKET_LABELS[ticketType]} × ${quantity}`,
            notificationType: 'admin_ticket_purchase',
          }),
          signal: adminController.signal,
        })
          .catch(e => console.error('[n8n] admin webhook error:', e, 'orderId:', orderId))
          .finally(() => clearTimeout(adminTimeout));
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId,
          ticketCode,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: '決済処理に失敗しました' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[Square] payment error:', err);

    const detail =
      err?.errors?.[0]?.detail ||
      err?.errors?.[0]?.code ||
      'お支払いに失敗しました。もう一度お試しください。';

    return new Response(
      JSON.stringify({ success: false, error: detail }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
