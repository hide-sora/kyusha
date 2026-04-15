import { Resend } from 'resend';

const BASE_URL = 'https://classic-car-2026.com';

const TICKET_LABELS: Record<string, string> = {
  advance_car: '展示車両チケット（前売り）',
  advance_general: '一般入場（前売り）',
  day_general: '一般入場（当日）',
};

interface SendTicketEmailParams {
  to: string;
  name: string;
  ticketType: string;
  quantity: number;
  childQuantity: number;
  total: number;
  orderId: string;
  ticketCode: string;
}

export async function sendTicketEmail(params: SendTicketEmailParams) {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY が設定されていません');
    return;
  }

  const resend = new Resend(apiKey);
  const label = TICKET_LABELS[params.ticketType] ?? params.ticketType;
  const qrUrl = `${BASE_URL}/api/qr/${params.ticketCode}.png`;
  const verifyUrl = `${BASE_URL}/verify?code=${params.ticketCode}`;

  const html = buildEmailHtml({ ...params, label, qrUrl, verifyUrl });

  try {
    await resend.emails.send({
      from: '旧車サミット2026 <ticket@classic-car-2026.com>',
      to: params.to,
      subject: `【旧車サミット2026】チケット購入完了 - ${params.ticketCode}`,
      html,
    });
    console.log(`[Email] 送信完了: ${params.to} / ${params.ticketCode}`);
  } catch (err) {
    console.error('[Email] 送信失敗:', err);
  }
}

function buildEmailHtml(p: SendTicketEmailParams & { label: string; qrUrl: string; verifyUrl: string }): string {
  const quantityLine = p.quantity > 0
    ? `<tr><td style="color:#666;font-size:13px;padding:4px 0;">大人</td><td style="text-align:right;font-weight:700;font-size:13px;padding:4px 0;">${p.quantity}名</td></tr>`
    : '';
  const childLine = p.childQuantity > 0
    ? `<tr><td style="color:#666;font-size:13px;padding:4px 0;">小学生以下</td><td style="text-align:right;color:#2a7a4b;font-weight:700;font-size:13px;padding:4px 0;">${p.childQuantity}名（無料）</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- ヘッダー -->
        <tr>
          <td style="background:#1a1a1a;padding:28px 32px;">
            <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">KYUSHA SUMMIT 2026</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:800;">チケット購入完了</h1>
          </td>
        </tr>

        <!-- メッセージ -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0;color:#333;font-size:15px;">${p.name} 様</p>
            <p style="margin:8px 0 0;color:#555;font-size:13px;line-height:1.7;">
              ご購入ありがとうございます。<br>
              以下のチケットをご用意いたしました。<strong>入場時にQRコードをスタッフにご提示ください。</strong>
            </p>
          </td>
        </tr>

        <!-- チケット詳細 -->
        <tr>
          <td style="padding:20px 32px;">
            <table width="100%" style="background:#f9f9f9;border-radius:12px;padding:20px;border:1px solid #eee;" cellpadding="0" cellspacing="0">
              <tr>
                <td colspan="2" style="padding-bottom:12px;">
                  <p style="margin:0;font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;">TICKET TYPE</p>
                  <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#1a1a1a;">${p.label}</p>
                </td>
              </tr>
              <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:4px 0 8px;"></td></tr>
              ${quantityLine}
              ${childLine}
              <tr><td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:8px 0;"></td></tr>
              <tr>
                <td style="color:#666;font-size:13px;">合計金額</td>
                <td style="text-align:right;font-size:20px;font-weight:800;color:#1a1a1a;">¥${p.total.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color:#999;font-size:11px;padding-top:8px;">チケットコード</td>
                <td style="text-align:right;font-family:monospace;font-size:15px;font-weight:800;color:#1a1a1a;padding-top:8px;letter-spacing:1px;">${p.ticketCode}</td>
              </tr>
              <tr>
                <td style="color:#999;font-size:11px;padding-top:4px;">注文番号</td>
                <td style="text-align:right;font-family:monospace;font-size:10px;color:#bbb;padding-top:4px;">${p.orderId}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- QRコード -->
        <tr>
          <td style="padding:0 32px 24px;text-align:center;">
            <p style="margin:0 0 14px;font-size:12px;color:#666;">スタッフにこちらのQRコードをご提示ください</p>
            <a href="${p.verifyUrl}" style="display:inline-block;border:2px solid #eee;border-radius:12px;padding:8px;background:#fff;">
              <img src="${p.qrUrl}" width="200" height="200" alt="入場QRコード" style="display:block;" />
            </a>
            <p style="margin:10px 0 0;font-size:14px;font-weight:800;letter-spacing:2px;color:#1a1a1a;font-family:monospace;">${p.ticketCode}</p>
          </td>
        </tr>

        <!-- イベント情報 -->
        <tr>
          <td style="padding:0 32px 28px;">
            <table width="100%" style="background:#fffbef;border-radius:12px;padding:16px;border:1px solid #f0e5bb;" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 8px;font-size:11px;color:#9a7a1a;letter-spacing:2px;text-transform:uppercase;font-weight:700;">EVENT INFO</p>
                  <p style="margin:0;font-size:13px;color:#555;line-height:2.0;">
                    📅 2026年4月26日（日）<br>
                    📍 モビリティリゾートもてぎ 南コース<br>
                    🚗 主催: 水戸道楽TV
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- フッター -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.8;">
              このメールはチケット購入確認のために自動送信されています。<br>
              お問い合わせ: <a href="https://classic-car-2026.com" style="color:#aaa;">classic-car-2026.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
