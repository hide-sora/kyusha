import { useState, useEffect } from 'react';
import { scheduleEvents, type ScheduleEvent } from '../../data/schedule';

function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function EventCard({ event, isActive, isPast }: {
  event: ScheduleEvent;
  isActive: boolean;
  isPast: boolean;
}) {
  return (
    <div className={`relative flex gap-4 ${isPast ? 'opacity-40' : ''}`}>
      {/* タイムライン線 + ドット */}
      <div className="flex flex-col items-center shrink-0 w-12">
        <span className="font-display font-600 text-xs text-muted-foreground tabular-nums">
          {event.time}
        </span>
        <div className={`w-3 h-3 rounded-full mt-2 border-2 shrink-0 ${
          isActive
            ? 'bg-primary border-primary shadow-[0_0_10px_hsl(42,85%,55%)]'
            : isPast
              ? 'bg-muted-foreground/30 border-muted-foreground/30'
              : 'bg-secondary border-border'
        }`} />
        <div className="w-px flex-1 bg-border mt-1" />
      </div>

      {/* コンテンツ */}
      <div className={`flex-1 pb-6 pt-0.5 ${isActive ? '' : ''}`}>
        <div className={`rounded-card p-4 transition-all ${
          isActive
            ? 'bg-primary/10 border border-primary/30'
            : 'bg-card border border-border'
        }`}>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-display font-700 text-primary uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              NOW
            </span>
          )}
          <h3 className={`font-700 text-sm leading-snug ${
            event.highlight ? 'text-primary' : 'text-foreground'
          }`}>
            {event.title}
          </h3>
          {event.description && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {event.description}
            </p>
          )}
          {event.location && (
            <p className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
              <span className="i-ph-map-pin-duotone text-sm" />
              {event.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);

  useEffect(() => {
    const timer = setInterval(() => setNowMinutes(getNowMinutes()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 max-w-lg mx-auto">
      {scheduleEvents.map((event, i) => {
        const isActive = nowMinutes >= event.startMinutes && nowMinutes < event.endMinutes;
        const isPast = nowMinutes >= event.endMinutes;
        return <EventCard key={i} event={event} isActive={isActive} isPast={isPast} />;
      })}
    </div>
  );
}
