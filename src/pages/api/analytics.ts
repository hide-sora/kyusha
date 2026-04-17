import type { APIRoute } from 'astro';

const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';

interface PVRecord {
  path: string;
  device_id?: string;
  referrer: string;
  created?: string;
}

// ボットスキャン・静的ファイル等のノイズ
const NOISE_RE = /^\/(robots\.txt|sw\.js|apple-touch-icon|wp-|wordpress|blog\/|web\/|wp\/|cms\/|shop\/|site\/|news\/|test\/|sito\/|website\/|2019\/|2020\/|xmlrpc|\.env|\.git|\.php)/i;
const isNoise = (p: string) => NOISE_RE.test(p) || /\.(php|xml|asp|aspx)$/i.test(p) || p.startsWith('//');

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async () => {
  // 公開ルールでアクセス（認証不要）
  const records: PVRecord[] = [];
  let page = 1;
  let setupRequired = false;

  while (true) {
    // sort は指定しない（collectionの created 自動フィールドが有効でない場合に400エラーになるため）
    const res = await fetch(
      `${PB_URL}/api/collections/page_views/records?perPage=500&page=${page}`,
    );
    if (!res.ok) {
      // 404 = コレクション未作成、403 = ルール未公開
      if (res.status === 404 || res.status === 403) {
        setupRequired = true;
        break;
      }
      return json({ error: `PB fetch failed (${res.status})` }, 500);
    }
    const data = (await res.json()) as { items?: PVRecord[]; totalPages?: number };
    if (data.items) records.push(...data.items);
    if (!data.totalPages || page >= data.totalPages) break;
    page++;
  }

  if (setupRequired) {
    return json({
      setupRequired: true,
      totalPV: 0,
      todayPV: 0,
      uniqueVisitors: 0,
      pages: [],
      hourly: [],
      daily: [],
      referrers: [],
    });
  }

  // 今日の日付 (JST)
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayKey = nowJst.toISOString().slice(0, 10);

  const deviceSet = new Set<string>();
  const pageMap = new Map<string, { pv: number; devices: Set<string> }>();
  const hourlyMap = new Map<string, number>();
  const dailyMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  let todayPV = 0;
  let timestampsAvailable = false;
  let noiseCount = 0;
  let validCount = 0;

  for (const r of records) {
    // ボットスキャンなどを集計から除外
    if (isNoise(r.path)) {
      noiseCount++;
      continue;
    }
    validCount++;

    if (r.device_id) deviceSet.add(r.device_id);

    if (!pageMap.has(r.path)) pageMap.set(r.path, { pv: 0, devices: new Set() });
    const p = pageMap.get(r.path)!;
    p.pv++;
    if (r.device_id) p.devices.add(r.device_id);

    if (r.created) {
      timestampsAvailable = true;
      const d = new Date(r.created);
      const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
      const hourKey = jst.toISOString().slice(0, 13);
      const dayKey = jst.toISOString().slice(0, 10);
      hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);

      if (dayKey === todayKey) todayPV++;
    }

    const ref = r.referrer || '';
    if (ref) {
      try {
        const host = new URL(ref).hostname;
        referrerMap.set(host, (referrerMap.get(host) || 0) + 1);
      } catch {
        referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
      }
    }
  }

  const pages = Array.from(pageMap.entries())
    .map(([path, { pv, devices }]) => ({ path, pv, uv: devices.size }))
    .sort((a, b) => b.pv - a.pv);

  const hourly = Array.from(hourlyMap.entries())
    .map(([hour, pv]) => ({ hour, pv }))
    .sort((a, b) => a.hour.localeCompare(b.hour))
    .slice(-24);

  const daily = Array.from(dailyMap.entries())
    .map(([date, pv]) => ({ date, pv }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const referrers = Array.from(referrerMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return json({
    setupRequired: false,
    timestampsAvailable,
    totalPV: validCount,
    botHits: noiseCount,
    todayPV,
    uniqueVisitors: deviceSet.size,
    pages,
    hourly,
    daily,
    referrers,
  });
};
