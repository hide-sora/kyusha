import { useState, useEffect } from 'react';
import { scheduleEvents, type ScheduleEvent } from '../../data/schedule';

const EVENT_DATE = '2026-04-26';

function isEventDay(): boolean {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }) === EVENT_DATE;
}

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

type Status = 'completed' | 'active' | 'upcoming';

function getStatus(event: ScheduleEvent, nowMinutes: number, eventDay: boolean): Status {
  if (!eventDay) return 'upcoming';
  if (nowMinutes >= event.endMinutes) return 'completed';
  if (nowMinutes >= event.startMinutes && nowMinutes < event.endMinutes) return 'active';
  return 'upcoming';
}

function StatusDot({ status }: { status: Status }) {
  if (status === 'completed') {
    return (
      <div className="w-7 h-7 rounded-full bg-on-surface text-surface flex-center shrink-0 z-10">
        <span className="i-ph-check-bold text-xs" />
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="w-7 h-7 rounded-full border-2 border-on-surface bg-surface flex-center shrink-0 z-10 relative">
        <div className="w-2.5 h-2.5 rounded-full bg-on-surface animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full border-2 border-outline-variant bg-surface flex-center shrink-0 z-10">
      <div className="w-2 h-2 rounded-full bg-outline-variant" />
    </div>
  );
}

function EventCard({ event, status, onPoster }: { event: ScheduleEvent; status: Status; onPoster?: () => void }) {
  return (
    <div
      className={`flex-1 min-w-0 rounded-xl p-4 transition-all duration-200 ${
        status === 'active'
          ? 'bg-surface-container-lowest shadow-[0_20px_40px_rgba(46,51,54,0.08)]'
          : status === 'completed'
            ? 'bg-transparent'
            : 'bg-surface-container-low'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Time + Status Badge */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-700 ${
              status === 'active' ? 'text-secondary' : 'text-on-surface-variant'
            }`}>
              {event.time}
            </span>
            {status === 'active' && (
              <span className="inline-flex items-center bg-on-surface text-surface px-2 py-0.5 rounded text-[9px] font-700 tracking-widest uppercase leading-none">
                Now
              </span>
            )}
            {status === 'completed' && (
              <span className="text-[9px] font-600 text-on-surface-variant/50 uppercase tracking-wider">
                終了
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-display font-700 leading-snug ${
            status === 'active'
              ? 'text-base font-800 text-on-surface'
              : status === 'completed'
                ? 'text-sm text-on-surface-variant'
                : 'text-sm text-on-surface'
          }`}>
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className={`text-xs leading-relaxed mt-1 ${
              status === 'completed' ? 'text-on-surface-variant/50' : 'text-on-surface-variant'
            }`}>
              {event.description}
            </p>
          )}

          {/* Location badge + Poster button */}
          {status !== 'completed' && (event.location || event.poster) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {event.location && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-700 uppercase tracking-wider ${
                  status === 'active'
                    ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  <span className="i-ph-map-pin-duotone text-[10px]" />
                  {event.location}
                </span>
              )}
              {event.poster && onPoster && (
                <button
                  type="button"
                  onClick={onPoster}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-700 tracking-wider bg-on-surface text-surface active:scale-95 transition-transform duration-150 cursor-pointer"
                >
                  <span className="i-ph-image-duotone text-[10px]" />
                  詳細
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right icon for highlight events */}
        {event.highlight && status !== 'completed' && (
          <div className={`p-2.5 rounded-xl shrink-0 ${
            status === 'active'
              ? 'bg-on-surface text-surface'
              : 'bg-secondary-fixed text-on-secondary-fixed'
          }`}>
            <span className="i-ph-star-duotone text-base" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Timeline() {
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);
  const [eventDay, setEventDay] = useState(isEventDay);
  const [posterSrc, setPosterSrc] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMinutes(getNowMinutes());
      setEventDay(isEventDay());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-5 max-w-lg mx-auto">
      {scheduleEvents.map((event, i) => {
        const status = getStatus(event, nowMinutes, eventDay);
        const isLast = i === scheduleEvents.length - 1;

        return (
          <div key={i} className="relative flex gap-3">
            {/* Connector line */}
            {!isLast && (
              <div
                className="absolute left-3.5 top-9 bottom-0 w-px"
                style={{
                  background: status === 'completed'
                    ? 'var(--un-color-on-surface, #2e3336)'
                    : status === 'active'
                      ? 'linear-gradient(to bottom, var(--un-color-on-surface, #2e3336) 0%, var(--un-color-outline-variant, #aeb2b6) 100%)'
                      : 'var(--un-color-outline-variant, #aeb2b6)',
                  opacity: status === 'completed' ? 0.3 : status === 'active' ? 0.5 : 0.3,
                }}
              />
            )}

            {/* Dot column */}
            <div className="flex flex-col items-center pt-4">
              <StatusDot status={status} />
            </div>

            {/* Event content */}
            <div className={`flex-1 min-w-0 pb-3 ${status === 'completed' ? 'opacity-50' : ''}`}>
              <EventCard event={event} status={status} onPoster={event.poster ? () => setPosterSrc(event.poster!) : undefined} />
            </div>
          </div>
        );
      })}

      {/* Poster modal */}
      {posterSrc && (
        <div
          className="fixed inset-0 z-[70] flex-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setPosterSrc(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/20 flex-center text-white text-2xl cursor-pointer"
            onClick={() => setPosterSrc(null)}
          >
            &times;
          </button>
          <img
            src={posterSrc}
            alt="イベント詳細"
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
