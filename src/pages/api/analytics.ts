import type { APIRoute } from 'astro';

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

interface PVRecord {
  path: string;
  device_id: string;
  referrer: string;
  created: string;
}

export const GET: APIRoute = async () => {
  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const token = await getPbToken();
  if (!token) return json({ error: 'PB auth failed' }, 500);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': token,
  };

  // コレクション存在チェック
  const check = await fetch(`${PB_URL}/api/collections/page_views`, { headers });
  if (!check.ok) {
    return json({ totalPV: 0, uniqueVisitors: 0, pages: [], hourly: [], daily: [] });
  }

  // 全レコード取得（ページネーション）
  const records: PVRecord[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${PB_URL}/api/collections/page_views/records?perPage=500&page=${page}&sort=-created`,
      { headers },
    );
    const data = await res.json() as { items?: PVRecord[]; totalPages?: number };
    if (data.items) records.push(...data.items);
    if (!data.totalPages || page >= data.totalPages) break;
    page++;
  }

  // 今日の日付 (JST)
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayKey = nowJst.toISOString().slice(0, 10);

  // 集計
  const deviceSet = new Set<string>();
  const pageMap = new Map<string, { pv: number; devices: Set<string> }>();
  const hourlyMap = new Map<string, number>();
  const dailyMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  let todayPV = 0;

  for (const r of records) {
    deviceSet.add(r.device_id);

    // ページ別
    if (!pageMap.has(r.path)) pageMap.set(r.path, { pv: 0, devices: new Set() });
    const p = pageMap.get(r.path)!;
    p.pv++;
    p.devices.add(r.device_id);

    // 日別 (JST = UTC+9)
    const d = new Date(r.created);
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const hourKey = jst.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const dayKey = jst.toISOString().slice(0, 10);
    hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
    dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);

    if (dayKey === todayKey) todayPV++;

    // 流入元
    const ref = r.referrer || '';
    if (ref) {
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
    }
  }

  const pages = Array.from(pageMap.entries())
    .map(([path, { pv, devices }]) => ({ path, pv, uv: devices.size }))
    .sort((a, b) => b.pv - a.pv);

  const hourly = Array.from(hourlyMap.entries())
    .map(([hour, pv]) => ({ hour, pv }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const daily = Array.from(dailyMap.entries())
    .map(([date, pv]) => ({ date, pv }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const referrers = Array.from(referrerMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);

  return json({
    totalPV: records.length,
    todayPV,
    uniqueVisitors: deviceSet.size,
    pages,
    hourly,
    daily,
    referrers,
  });
};
