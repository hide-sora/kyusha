/**
 * メール送信用のチケットHTMLを生成する。
 * TicketCard.tsx と同じ見た目を、メールクライアント互換の
 * インラインCSS + table レイアウトで再現する。
 *
 * 画像は絶対URLである必要があるため、SITE_URL でベースを差し替える。
 */

const SITE_URL = 'https://classic-car-2026.com';

export interface TicketEmailParams {
  ticketLabel: string;
  name: string;
  quantity: number;
  childQuantity: number;
  ticketCode: string;
  orderId: string;
  total: number;
}

export function generateTicketEmailHtml(params: TicketEmailParams): string {
  const { ticketLabel, name, quantity, childQuantity, ticketCode, orderId, total } = params;
  const orderShort = orderId ? orderId.slice(-6).toUpperCase() : '------';
  const heroUrl = `${SITE_URL}/ticket/hero-car.jpg`;
  const qrUrl = `${SITE_URL}/api/qr/${ticketCode}.png`;
  const safeName = escapeHtml(name || '—');
  const safeLabel = escapeHtml(ticketLabel);

  const childBlock = childQuantity > 0
    ? `<span style="display:inline-block;margin-left:18px;">
         <span style="font-size:10px;letter-spacing:0.25em;font-weight:700;opacity:0.55;margin-right:4px;">小人</span>
         <span style="font-family:'Oswald',Arial,sans-serif;font-weight:800;font-size:26px;line-height:1;">×${childQuantity}</span>
       </span>`
    : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>旧車サミット2026 電子チケット</title>
</head>
<body style="margin:0;padding:24px 12px;background:#f4f4f6;font-family:'Zen Maru Gothic','Hiragino Sans',sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="padding:0 0 16px 0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#666;letter-spacing:0.2em;">KYUSHA SUMMIT 2026</p>
        <p style="margin:8px 0 0 0;font-size:15px;color:#111;">
          ${safeName} 様<br />
          ご購入ありがとうございます。<br />
          以下の電子チケットを当日会場でご提示ください。
        </p>
      </td>
    </tr>
    <tr>
      <td align="center">

        <!-- ── チケット本体 ── -->
        <table role="presentation" width="340" cellpadding="0" cellspacing="0" style="width:340px;max-width:340px;border-collapse:separate;box-shadow:0 24px 48px rgba(0,0,0,0.25);">
          <!-- 上段：車ヒーロー -->
          <tr>
            <td style="background-color:#000000;border-top-left-radius:16px;border-top-right-radius:16px;padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="position:relative;background-image:url('${heroUrl}');background-size:cover;background-position:center;height:128px;border-top-left-radius:16px;border-top-right-radius:16px;" background="${heroUrl}" bgcolor="#000000" valign="top">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;height:128px;">
                      <tr>
                        <td style="padding:12px 16px 0 16px;font-size:9px;letter-spacing:0.35em;color:rgba(255,255,255,0.7);vertical-align:top;">
                          夢と挑戦の軌跡
                        </td>
                        <td style="padding:12px 16px 0 16px;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.5);text-align:right;vertical-align:top;">
                          ADMIT ONE
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 中段：イベント情報（黒） -->
          <tr>
            <td style="background-color:#000000;color:#ffffff;padding:8px 20px 16px 20px;">
              <p style="margin:0;font-family:'Oswald',Arial,sans-serif;font-weight:600;font-size:10px;letter-spacing:0.3em;color:rgba(255,255,255,0.6);">
                第3回 水戸道楽TV 主催
              </p>
              <p style="margin:4px 0 0 0;font-family:'Oswald',Arial,sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.01em;line-height:1.15;color:#ffffff;">
                YouTuber 旧車サミット 2026
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr>
                  <td style="vertical-align:bottom;">
                    <span style="font-family:'Oswald',Arial,sans-serif;font-weight:800;font-size:34px;line-height:1;color:#ffffff;">4<span style="opacity:0.6;">/</span>26</span>
                    <span style="font-size:12px;color:rgba(255,255,255,0.7);margin-left:6px;">(日)</span>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <span style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.3);border-radius:3px;padding:2px 6px;">
                      雨天決行
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin:10px 0 0 0;font-size:11px;color:rgba(255,255,255,0.8);">
                🕘 9:00〜15:00
              </p>
              <p style="margin:4px 0 0 0;font-size:11px;color:rgba(255,255,255,0.8);">
                📍 モビリティリゾートもてぎ 南コース
              </p>
            </td>
          </tr>

          <!-- ミシン目 -->
          <tr>
            <td style="background-color:#c6dc4a;padding:0;line-height:0;font-size:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#000000;height:8px;width:8px;border-bottom-right-radius:8px;"></td>
                  <td style="background-color:#c6dc4a;height:8px;border-top:2px dashed rgba(0,0,0,0.4);"></td>
                  <td style="background-color:#000000;height:8px;width:8px;border-bottom-left-radius:8px;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 下段：緑のスタブ -->
          <tr>
            <td style="background-color:#c6dc4a;color:#000000;padding:12px 18px 16px 18px;border-bottom-left-radius:16px;border-bottom-right-radius:16px;">

              <!-- 名前・人数を大きく表示 -->
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;font-weight:700;opacity:0.55;">NAME</p>
              <p style="margin:2px 0 0 0;font-family:'Oswald',Arial,sans-serif;font-weight:800;font-size:22px;line-height:1.15;">
                ${safeName} <span style="font-size:14px;font-weight:700;opacity:0.8;">様</span>
              </p>

              <p style="margin:10px 0 0 0;">
                <span style="font-size:10px;letter-spacing:0.25em;font-weight:700;opacity:0.55;margin-right:4px;">大人</span>
                <span style="font-family:'Oswald',Arial,sans-serif;font-weight:800;font-size:26px;line-height:1;">×${quantity}</span>
                ${childBlock}
              </p>

              <!-- QR + チケット情報 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-top:1px dashed rgba(0,0,0,0.3);padding-top:12px;">
                <tr>
                  <td width="92" valign="top" style="padding-top:4px;">
                    ${ticketCode ? `<img src="${qrUrl}" alt="入場QRコード" width="84" height="84" style="display:block;width:84px;height:84px;background:#ffffff;padding:4px;border-radius:6px;" />` : ''}
                  </td>
                  <td valign="top" style="padding-left:10px;">
                    <p style="margin:0;font-size:9px;letter-spacing:0.3em;font-weight:700;opacity:0.55;">TICKET</p>
                    <p style="margin:2px 0 0 0;font-family:'Oswald',Arial,sans-serif;font-weight:800;font-size:13px;line-height:1.15;">
                      ${safeLabel}
                    </p>
                    ${ticketCode ? `<p style="margin:6px 0 0 0;font-family:'Courier New',monospace;font-weight:800;font-size:14px;letter-spacing:0.15em;line-height:1;">${escapeHtml(ticketCode)}</p>` : ''}
                    <p style="margin:6px 0 0 0;font-family:'Oswald',Arial,sans-serif;font-weight:800;font-size:16px;line-height:1;">
                      ¥${total.toLocaleString()}
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px dashed rgba(0,0,0,0.25);padding-top:8px;">
                <tr>
                  <td style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;opacity:0.7;">
                    № ${escapeHtml(orderShort)}
                  </td>
                  <td align="right" style="font-size:9px;opacity:0.7;">
                    本券を当日会場にてご提示ください
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>

    <tr>
      <td style="padding:20px 8px 0 8px;font-size:12px;color:#444;line-height:1.7;">
        <p style="margin:0 0 8px 0;font-weight:700;">ご来場にあたって</p>
        <ul style="margin:0;padding-left:18px;">
          <li>当日の9時付近は非常に混雑します。速やかなご来場をお願いします。</li>
          <li>駐車場が満車の場合、追加料金をいただく場合があります。</li>
          <li>本メールのチケット画面、または <a href="${SITE_URL}/" style="color:#0a7;">${SITE_URL}</a> のマイチケット画面をご提示ください。</li>
          <li>電波が不安定な場合に備え、チケット画面のスクリーンショット保存をおすすめします。</li>
        </ul>
      </td>
    </tr>

    <tr>
      <td style="padding:24px 8px 0 8px;font-size:11px;color:#888;text-align:center;">
        旧車サミット2026 実行委員会 / 水戸道楽TV<br />
        本メールは送信専用です。
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
