const STORAGE_KEY = 'kyusha_device_id';

/** デバイス固有のIDを取得（なければ生成） */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    id = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
