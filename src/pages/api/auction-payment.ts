import type { APIRoute } from 'astro';
import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';

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
    itemId?: string;
    amount?: number;
    name?: string;
    email?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'リクエストが不正です' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { sourceId, itemId, amount, name, email } = body;

  if (!sourceId || !itemId || !amount || !name || !email) {
    return new Response(
      JSON.stringify({ success: false, error: '必須項目が不足しています' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // PocketBase からアイテム情報を取得して金額を検証
  const pbToken = await getPbToken();
  let itemTitle = '';
  try {
    const itemRes = await fetch(`${PB_URL}/api/collections/auction_items/records/${itemId}`, {
      headers: { Authorization: pbToken },
    });
    const itemData = await itemRes.json() as { current_price?: number; status?: string; title?: string };
    if (itemData.status !== 'ended') {
      return new Response(
        JSON.stringify({ success: false, error: 'このオークションはまだ終了していません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (itemData.current_price !== amount) {
      return new Response(
        JSON.stringify({ success: false, error: '金額が一致しません' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    itemTitle = itemData.title || '';
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'アイテム情報の取得に失敗しました' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
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
        amount: BigInt(amount),
        currency: 'JPY',
      },
      note: `旧車サミット2026 チャリティーオークション - ${itemTitle}`,
      buyerEmailAddress: email,
      billingAddress: { firstName: name },
    });

    if (response.payment?.status === 'COMPLETED') {
      const paymentId = response.payment.id ?? '';

      // PocketBase に支払い記録を保存
      fetch(`${PB_URL}/api/collections/auction_payments/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: pbToken },
        body: JSON.stringify({
          item: itemId,
          amount,
          payment_method: 'card',
          payment_id: paymentId,
          buyer_name: name,
          buyer_email: email,
        }),
      }).catch(e => console.error('[PB] auction payment record error:', e));

      return new Response(
        JSON.stringify({ success: true, paymentId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: '決済処理に失敗しました' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[Square] auction payment error:', err);
    const detail = err?.errors?.[0]?.detail || 'お支払いに失敗しました。もう一度お試しください。';
    return new Response(
      JSON.stringify({ success: false, error: detail }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
