export interface ShowcaseItem {
  lot: number;
  title: string;
  subtitle?: string;
  description: string;
  youtuber: string;
  startPrice: number;
  /** gradient bg per card */
  gradient: string;
  icon: string;
  images?: string[];
}

export const showcaseItems: ShowcaseItem[] = [
  {
    lot: 1,
    title: 'ジムニー JA11 & 自作テーブル',
    description: '水戸道楽TVから2品出品！リフトアップ＆RECAROシート装備のJA11ジムニーと、手作りテーブル。',
    youtuber: '水戸道楽TV',
    startPrice: 0,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    icon: 'i-ph-car-profile-duotone',
    images: ['/auction/mito-jimny-1.jpg', '/auction/mito-jimny-2.jpg'],
  },
  {
    lot: 2,
    title: 'マフラー・ホイール他パーツ',
    description: 'シュンヤのガレージライフから放出！柿本改マフラー、オルタネーター、オーバーフェンダーなど。',
    youtuber: 'シュンヤのガレージライフ',
    startPrice: 0,
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d3a4a 100%)',
    icon: 'i-ph-garage-duotone',
    images: ['/auction/shunya-muffler-1.jpg', '/auction/shunya-muffler-2.jpg', '/auction/shunya-alternator.jpg', '/auction/shunya-fender.jpg'],
  },
  {
    lot: 3,
    title: 'フェアレディZ Z33',
    description: '水島翔の愛車！カスタムグラフィック＆ワイドボディのZ33。深リムホイール装着。',
    youtuber: '水島 翔',
    startPrice: 8000000,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #1e293b 50%, #0f172a 100%)',
    icon: 'i-ph-steering-wheel-duotone',
    images: ['/auction/sho-z33-1.jpg', '/auction/sho-z33-2.jpg', '/auction/sho-z33-3.jpg'],
  },
];
