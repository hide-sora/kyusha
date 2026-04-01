import { useState, useEffect } from 'react';

// イベント開始: 2026年4月26日 9:00 JST
const EVENT_DATE = new Date('2026-04-26T09:00:00+09:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft | null {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden w-14 h-14 sm:w-16 sm:h-16 bg-secondary rounded-lg flex-center border border-border">
        <span className="font-display font-700 text-2xl sm:text-3xl text-gold-gradient tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground font-500 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return (
      <div className="text-center py-4">
        <span className="font-display font-700 text-xl text-primary">
          EVENT IS LIVE!
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-center">
      <CountUnit value={timeLeft.days} label="days" />
      <span className="font-display text-2xl text-muted-foreground self-start mt-3.5">:</span>
      <CountUnit value={timeLeft.hours} label="hrs" />
      <span className="font-display text-2xl text-muted-foreground self-start mt-3.5">:</span>
      <CountUnit value={timeLeft.minutes} label="min" />
      <span className="font-display text-2xl text-muted-foreground self-start mt-3.5">:</span>
      <CountUnit value={timeLeft.seconds} label="sec" />
    </div>
  );
}
