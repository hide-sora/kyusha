import QRCode from 'qrcode';

/** KS26-XXXXXXX 形式のチケットコードを生成（32^7 = 34B 通り、衝突率を十分低く抑える） */
export function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字を除外
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `KS26-${code}`;
}

/** チケットコードから検証URLのQRコードをbase64 PNG で返す */
export async function generateTicketQR(ticketCode: string, baseUrl = 'https://classic-car-2026.com'): Promise<string> {
  const url = `${baseUrl}/verify?code=${ticketCode}`;
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });
}
