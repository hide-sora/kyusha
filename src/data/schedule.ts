export interface ScheduleEvent {
  time: string;
  title: string;
  description?: string;
  location?: string;
  highlight?: boolean;
  poster?: string;
  /** "HH:mm" 形式で比較用 */
  startMinutes: number;
  endMinutes: number;
}

/** 分に変換 */
function hm(h: number, m: number) {
  return h * 60 + m;
}

export const scheduleEvents: ScheduleEvent[] = [
  {
    time: '8:00',
    title: 'ゲートオープン',
    description: '南ゲートよりお入りください',
    location: '南ゲート',
    startMinutes: hm(8, 0),
    endMinutes: hm(9, 0),
  },
  {
    time: '9:00',
    title: 'イベント開始',
    description: 'モビリティリゾートもてぎ南コース',
    startMinutes: hm(9, 0),
    endMinutes: hm(10, 0),
  },
  {
    time: '10:00',
    title: '開会式',
    description: 'イベントステージウィング車両にて',
    location: 'イベントステージ',
    highlight: true,
    startMinutes: hm(10, 0),
    endMinutes: hm(11, 0),
  },
  {
    time: '11:00',
    title: '自動車系YouTuber勢揃い! トークショー',
    description: 'イベントステージウィング車両にて',
    location: 'イベントステージ',
    highlight: true,
    startMinutes: hm(11, 0),
    endMinutes: hm(12, 0),
  },
  {
    time: '12:00',
    title: 'アルミ削り出しノベルティサイコロ じゃんけん大会',
    description: '水戸道楽TV × 有限会社小林製作所｜30名限定！じゃんけんで勝ち残った方にノベルティサイコロをプレゼント！',
    location: 'イベントステージ',
    highlight: true,
    poster: '/schedule/dice-janken.png',
    startMinutes: hm(12, 0),
    endMinutes: hm(13, 0),
  },
  {
    time: '13:00',
    title: 'チャリティーオークション',
    description: 'YouTuberが用意したとっておきの出品物を専用アプリでオークション。参加は会場者全員可能です!',
    location: 'アプリ内',
    highlight: true,
    startMinutes: hm(13, 0),
    endMinutes: hm(13, 30),
  },
  {
    time: '13:30',
    title: 'イベント車両グランプリ投票締切',
    description: 'アプリ内で投票',
    location: 'アプリ内',
    highlight: true,
    startMinutes: hm(13, 30),
    endMinutes: hm(14, 0),
  },
  {
    time: '14:00',
    title: '水戸道楽TV イベント会場散策',
    description: '時間が許す限りイベント会場を歩いて回り、協賛ブースや皆様の愛車を見せていただきます!',
    startMinutes: hm(14, 0),
    endMinutes: hm(14, 30),
  },
  {
    time: '14:30',
    title: 'エントリー車両グランプリ & 各賞発表 & 閉会式',
    description: 'イベントステージウィング車両にて',
    location: 'イベントステージ',
    highlight: true,
    startMinutes: hm(14, 30),
    endMinutes: hm(15, 0),
  },
  {
    time: '15:00',
    title: '車両退場開始',
    description: '南コースの契約関係上、速やかに退場協力お願いします',
    startMinutes: hm(15, 0),
    endMinutes: hm(16, 0),
  },
];
