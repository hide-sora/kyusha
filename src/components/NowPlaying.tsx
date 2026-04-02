import { useState, useEffect } from 'react';
import { scheduleEvents } from '../data/schedule';

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function NowPlaying() {
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);

  useEffect(() => {
    const timer = setInterval(() => setNowMinutes(getNowMinutes()), 30000);
    return () => clearInterval(timer);
  }, []);

  const current = scheduleEvents.find(
    (e) => nowMinutes >= e.startMinutes && nowMinutes < e.endMinutes
  );
  const nextIdx = scheduleEvents.findIndex((e) => nowMinutes < e.startMinutes);
  const next = nextIdx >= 0 ? scheduleEvents[nextIdx] : null;

  // Before event or after event — show nothing
  if (!current && !next) return null;

  return (
    <a href="/schedule" className="block">
      <div className="space-y-2">
        {current && (
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_20px_40px_rgba(46,51,54,0.06)] card-press">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center shrink-0">
                <span className="inline-flex items-center bg-on-surface text-surface px-2 py-0.5 rounded text-[9px] font-700 tracking-widest uppercase">
                  Now
                </span>
                <span className="text-[10px] font-700 text-on-surface-variant mt-1">
                  {current.time}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-700 text-sm text-on-surface truncate">
                  {current.title}
                </h3>
                {current.location && (
                  <p className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <span className="i-ph-map-pin-duotone text-xs" />
                    {current.location}
                  </p>
                )}
              </div>
              <span className="i-ph-caret-right-bold text-on-surface-variant/30 shrink-0" />
            </div>
          </div>
        )}

        {next && (
          <div className="bg-surface-container-low rounded-xl p-4 card-press">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-[9px] font-700 tracking-widest uppercase text-on-surface-variant">
                  Next
                </span>
                <span className="text-[10px] font-700 text-on-surface-variant mt-1">
                  {next.time}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-600 text-sm text-on-surface-variant truncate">
                  {next.title}
                </h3>
                {next.location && (
                  <p className="text-[11px] text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                    <span className="i-ph-map-pin-duotone text-xs" />
                    {next.location}
                  </p>
                )}
              </div>
              <span className="i-ph-caret-right-bold text-on-surface-variant/20 shrink-0" />
            </div>
          </div>
        )}
      </div>
    </a>
  );
}
