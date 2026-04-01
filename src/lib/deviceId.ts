const STORAGE_KEY = 'kyusha_device_id';

/** デバイス固有のUUIDを取得（なければ生成） */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
