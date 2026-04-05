import { useState, useEffect, useRef } from 'react';

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

function FlipDigit({ value }: { value: string }) {
  const prevRef = useRef(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlipping(true);
      prevRef.current = value;
      const t = setTimeout(() => setFlipping(false), 350);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className={`inline-block ${flipping ? 'digit-flip-enter' : ''}`}>
      {value}
    </span>
  );
}

function CountUnit({ value, label, pad = 2 }: { value: number; label: string; pad?: number }) {
  const display = String(value).padStart(pad, '0');
  return (
    <div className="flex flex-col items-center">
      <span className="font-display font-800 text-4xl tracking-tighter tabular-nums text-on-surface leading-none">
        {display.split('').map((d, i) => (
          <FlipDigit key={i} value={d} />
        ))}
      </span>
      <span className="text-[9px] tracking-widest font-700 uppercase text-on-surface-variant mt-2">
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
        <span className="font-display font-800 text-2xl text-on-surface tracking-tight animate-pulse">
          EVENT IS LIVE
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <CountUnit value={timeLeft.days} label="DAYS" />
      <span className="font-display text-2xl font-300 text-outline-variant mb-5">:</span>
      <CountUnit value={timeLeft.hours} label="HRS" />
      <span className="font-display text-2xl font-300 text-outline-variant mb-5">:</span>
      <CountUnit value={timeLeft.minutes} label="MIN" />
      <span className="font-display text-2xl font-300 text-outline-variant mb-5">:</span>
      <CountUnit value={timeLeft.seconds} label="SEC" />
    </div>
  );
}
