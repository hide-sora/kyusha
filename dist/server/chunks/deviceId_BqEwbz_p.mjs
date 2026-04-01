import PocketBase from 'pocketbase';

const PB_URL = "http://127.0.0.1:8093";
let pb;
function getPb() {
  if (!pb) {
    pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);
  }
  return pb;
}

const STORAGE_KEY = "kyusha_device_id";
function getDeviceId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export { getDeviceId as a, getPb as g };
