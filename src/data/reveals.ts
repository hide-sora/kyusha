// JST (UTC+9) helper
function jst(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00+09:00');
}

export interface RevealConfig {
  key: string;
  date: Date;
  label: string;
  icon: string;
  teaser: string;
  hint: string;
}

export const reveals = {
  schedule: {
    key: 'schedule',
    date: jst('2026-04-10'),
    label: 'タイムスケジュール',
    icon: 'i-ph-clock-countdown-duotone',
    teaser: 'イベントの流れ、まもなく公開！',
    hint: 'ステージイベントやサプライズ企画が目白押し',
  },
  map: {
    key: 'map',
    date: jst('2026-04-15'),
    label: '会場マップ',
    icon: 'i-ph-map-trifold-duotone',
    teaser: '247台の旧車がどこに集まる？',
    hint: '会場レイアウト＆展示エリア情報を公開予定',
  },
  auction: {
    key: 'auction',
    date: jst('2026-04-20'),
    label: 'チャリティーオークション',
    icon: 'i-ph-gavel-duotone',
    teaser: 'YouTuberの私物が続々登場予定！',
    hint: 'どんなお宝が出品されるか、お楽しみに...',
  },
  vote: {
    key: 'vote',
    date: jst('2026-04-24'),
    label: '旧車グランプリ投票',
    icon: 'i-ph-trophy-duotone',
    teaser: '投票システム、まもなくオープン！',
    hint: '247台の中から、あなたのNo.1を決めよう',
  },
} as const;

export type RevealKey = keyof typeof reveals;

export function isLocked(key: RevealKey): boolean {
  return new Date() < reveals[key].date;
}

export function formatRevealDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日（${weekday}）`;
}
