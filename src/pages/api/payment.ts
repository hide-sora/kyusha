import type { APIRoute } from 'astro';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { generateTicketCode } from '../../lib/ticket';

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
  };

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'リクエストが不正です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { sourceId, ticketType, quantity = 1, childQuantity = 0, name, email, amount } = body;

  if (!sourceId || !ticketType || !name || !email) {
    return new Response(
      JSON.stringify({ success: false, error: '必須項目が不足しています' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 金額の整合性チェック（サーバー側で再計算）
  const unitPrice = VALID_PRICES[ticketType];
  if (!unitPrice) {
    return new Response(
      JSON.stringify({ success: false, error: '無効なチケット種別です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const validAmount = unitPrice * Math.max(1, Math.min(10, quantity));

  if (amount !== validAmount) {
    return new Response(
      JSON.stringify({ success: false, error: '金額が一致しません' }),
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

  try {
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(validAmount),
        currency: 'JPY',
      },
      note: `旧車サミット2026 - ${TICKET_LABELS[ticketType]} × ${quantity}`,
      buyerEmailAddress: email,
      billingAddress: {
        firstName: name,
      },
    });

    if (response.payment?.status === 'COMPLETED') {
      const ticketCode = generateTicketCode();
      const orderId = response.payment.id ?? '';

      // PocketBase に購入記録を保存
      fetch(`${PB_URL}/api/collections/ticket_purchases/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': pbToken },
        body: JSON.stringify({
          ticket_type: ticketType,
          quantity,
          child_quantity: childQuantity,
          payment_id: orderId,
          ticket_code: ticketCode,
          buyer_name: name,
          buyer_email: email,
        }),
      }).catch(e => console.error('[PB] record error:', e));

      // n8n webhook でメール送信（fire-and-forget）
      const n8nUrl = import.meta.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            ticketType,
            ticketLabel: TICKET_LABELS[ticketType],
            quantity,
            childQuantity,
            total: validAmount,
            orderId,
            ticketCode,
            qrImageUrl: `https://classic-car-2026.com/api/qr/${ticketCode}.png`,
            verifyUrl: `https://classic-car-2026.com/verify?code=${ticketCode}`,
          }),
        }).catch(e => console.error('[n8n] webhook error:', e));
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
