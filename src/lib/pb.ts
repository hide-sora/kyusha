import PocketBase from 'pocketbase';

// PocketBase URL（開発時はローカル、本番は環境変数から）
const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://127.0.0.1:8093';

let pb: PocketBase;

export function getPb(): PocketBase {
  if (!pb) {
    pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);
  }
  return pb;
}
