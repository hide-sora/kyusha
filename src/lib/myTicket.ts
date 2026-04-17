/**
 * ユーザーが購入した電子チケット情報を localStorage に保存・復元する
 * （クライアント側での簡易キャッシュ。あくまで表示用で真偽は PocketBase のデータが正）
 */

const KEY = 'kyusha_my_ticket';

export interface MyTicket {
  ticketLabel: string;
  name: string;
  quantity: number;
  childQuantity: number;
  ticketCode: string;
  orderId: string;
  total: number;
  purchasedAt: number;
}

export function saveMyTicket(t: MyTicket): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
    // 他コンポーネント（FAB）に通知
    window.dispatchEvent(new CustomEvent('my-ticket-change'));
  } catch {
    // ignore
  }
}

export function loadMyTicket(): MyTicket | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !data.ticketCode) return null;
    return data as MyTicket;
  } catch {
    return null;
  }
}

export function clearMyTicket(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('my-ticket-change'));
  } catch {
    // ignore
  }
}
