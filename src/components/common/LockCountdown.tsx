import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

interface Props {
  targetDate: string;
}

function Unit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Divider line for flip-clock look */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1px',
            background: 'rgba(251,191,36,0.08)',
          }}
        />
        <span
          key={str}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1.625rem',
            color: '#fff',
            letterSpacing: '-0.03em',
            position: 'relative',
            zIndex: 1,
            animation: 'digitFlipIn 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {str}
        </span>
      </div>
      <span
        style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function LockCountdown({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calcTimeLeft(targetDate);
      if (!tl) {
        clearInterval(timer);
        window.location.reload();
        return;
      }
      setTimeLeft(tl);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div style={{ color: '#fbbf24', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.5rem' }}>
        解禁！
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.2em',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        情報解禁まで
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'flex-start' }}>
        <Unit value={timeLeft.days} label="日" />
        <div style={{ color: 'rgba(251,191,36,0.3)', fontWeight: 800, fontSize: '1.5rem', paddingTop: '16px' }}>:</div>
        <Unit value={timeLeft.hours} label="時" />
        <div style={{ color: 'rgba(251,191,36,0.3)', fontWeight: 800, fontSize: '1.5rem', paddingTop: '16px' }}>:</div>
        <Unit value={timeLeft.minutes} label="分" />
        <div style={{ color: 'rgba(251,191,36,0.3)', fontWeight: 800, fontSize: '1.5rem', paddingTop: '16px' }}>:</div>
        <Unit value={timeLeft.seconds} label="秒" />
      </div>
    </div>
  );
}
