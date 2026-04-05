import type { APIRoute } from 'astro';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';

const ADVANCE_CAR_STOCK = 93;
const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';

const TICKET_LABELS: Record<string, string> = {
  advance_car: '展示車両チケット（前売り）',
  advance_general: '一般入場（前売り）',
  day_general: '一般入場（当日）',
};

const VALID_PRICES: Record<string, number> = {
  advance_car: 8000,
  advance_general: 1500,
  day_general: 2500,
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

  const { sourceId, ticketType, quantity = 1, name, email, amount } = body;

  // バリデーション
  if (!sourceId || !ticketType || !name || !email) {
    return new Response(
      JSON.stringify({ success: false, error: '必須項目が不足しています' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 金額の整合性チェック（フロントエンドから送られた amount を信用せず再計算）
  const unitPrice = VALID_PRICES[ticketType];
  if (!unitPrice) {
    return new Response(
      JSON.stringify({ success: false, error: '無効なチケット種別です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const validAmount = unitPrice * Math.max(1, Math.min(10, quantity));

  // フロントの amount と一致確認
  if (amount !== validAmount) {
    return new Response(
      JSON.stringify({ success: false, error: '金額が一致しません' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 展示車両チケットの在庫チェック
  if (ticketType === 'advance_car') {
    try {
      const stockRes = await fetch(
        `${PB_URL}/api/collections/ticket_purchases/records?filter=ticket_type%3D%22advance_car%22&perPage=1`
      );
      const stockData = await stockRes.json() as { totalItems?: number };
      if ((stockData.totalItems ?? 0) >= ADVANCE_CAR_STOCK) {
        return new Response(
          JSON.stringify({ success: false, error: '展示車両チケットは完売しました' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch {
      // PB接続エラーは無視して続行
    }
  }

  const client = new SquareClient({
    token: accessToken,
    environment:
      import.meta.env.SQUARE_ENV === 'production'
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
      // PocketBase に購入記録を保存（在庫管理用）
      fetch(`${PB_URL}/api/collections/ticket_purchases/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_type: ticketType,
          quantity,
          payment_id: response.payment.id,
        }),
      }).catch(e => console.error('[PB] record error:', e));

      return new Response(
        JSON.stringify({
          success: true,
          orderId: response.payment.id,
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
