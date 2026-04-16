import { useState, useEffect, useCallback } from 'react';

interface PageStat {
  path: string;
  pv: number;
  uv: number;
}

interface HourBucket {
  hour: string;
  pv: number;
}

interface DayBucket {
  date: string;
  pv: number;
}

interface Referrer {
  domain: string;
  count: number;
}

interface AnalyticsData {
  totalPV: number;
  todayPV: number;
  uniqueVisitors: number;
  pages: PageStat[];
  hourly: HourBucket[];
  daily: DayBucket[];
  referrers: Referrer[];
}

const EMPTY: AnalyticsData = {
  totalPV: 0, todayPV: 0, uniqueVisitors: 0, pages: [], hourly: [], daily: [], referrers: [],
};

const PAGE_LABELS: Record<string, string> = {
  '/': 'トップ',
  '/vote': '投票',
  '/auction': 'オークション',
  '/schedule': 'スケジュール',
  '/map': 'マップ',
  '/ticket': 'チケット',
  '/creators': 'クリエイター',
  '/verify': '検証',
};

function formatHour(key: string): string {
  const h = key.slice(11, 13);
  return `${h}:00`;
}

function formatDate(key: string): string {
  const parts = key.split('-');
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex-center py-20">
        <div className="i-ph-spinner-bold text-2xl animate-spin text-on-surface-variant" />
      </div>
    );
  }

  const maxPagePV = Math.max(1, ...data.pages.map((p) => p.pv));
  const maxHourly = Math.max(1, ...data.hourly.map((h) => h.pv));
  const maxDaily = Math.max(1, ...data.daily.map((d) => d.pv));

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-5 text-center bg-surface-container-lowest shadow-sm">
          <p className="text-sm text-on-surface-variant mb-2">総アクセス数</p>
          <p className="font-display font-800 text-3xl tabular-nums text-on-surface">
            {data.totalPV.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl p-5 text-center bg-surface-container-lowest shadow-sm">
          <p className="text-sm text-on-surface-variant mb-2">本日のアクセス</p>
          <p className="font-display font-800 text-3xl tabular-nums text-on-surface">
            {data.todayPV.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ページ別アクセス */}
      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="i-ph-chart-bar-duotone text-lg text-on-surface-variant" />
          <h2 className="font-display font-700 text-base text-on-surface">ページ別アクセス</h2>
        </div>

        {data.pages.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">データなし</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.pages.map((p) => {
              const barW = (p.pv / maxPagePV) * 100;
              return (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-sm text-on-surface font-500 w-28 shrink-0 truncate">
                    {PAGE_LABELS[p.path] || p.path}
                  </span>
                  <div className="flex-1 h-6 bg-surface-container rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-secondary-fixed-dim rounded-lg transition-all duration-500"
                      style={{ width: `${barW}%` }}
                    />
                  </div>
                  <span className="font-display font-700 text-sm text-on-surface tabular-nums w-10 text-right">
                    {p.pv}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 流入元 */}
      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="i-ph-sign-in-duotone text-lg text-on-surface-variant" />
          <h2 className="font-display font-700 text-base text-on-surface">流入元</h2>
        </div>

        {data.referrers.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">データなし</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.referrers.map((r) => (
              <div key={r.domain} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-on-surface font-500 truncate">{r.domain}</span>
                <span className="font-display font-700 text-sm text-on-surface tabular-nums ml-2">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 時間別アクセス推移 */}
      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="i-ph-clock-duotone text-lg text-on-surface-variant" />
          <h2 className="font-display font-700 text-base text-on-surface">時間別アクセス推移</h2>
        </div>

        {data.hourly.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">データなし</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {data.hourly.map((h) => {
              const pct = (h.pv / maxHourly) * 100;
              return (
                <div key={h.hour} className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant w-10 shrink-0 tabular-nums font-600 text-right">
                    {formatHour(h.hour)}
                  </span>
                  <div className="flex-1 h-5 bg-surface-container rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-secondary-fixed-dim rounded-lg transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-display font-700 text-on-surface tabular-nums w-8 text-right">
                    {h.pv}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 日別アクセス推移 */}
      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="i-ph-chart-bar-duotone text-lg text-on-surface-variant" />
          <h2 className="font-display font-700 text-base text-on-surface">日別アクセス推移</h2>
        </div>

        {data.daily.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">データなし</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {data.daily.map((d) => {
              const pct = (d.pv / maxDaily) * 100;
              return (
                <div key={d.date} className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant w-10 shrink-0 tabular-nums font-600 text-right">
                    {formatDate(d.date)}
                  </span>
                  <div className="flex-1 h-5 bg-surface-container rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-secondary-fixed-dim rounded-lg transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-display font-700 text-on-surface tabular-nums w-8 text-right">
                    {d.pv}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
