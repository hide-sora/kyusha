export interface Creator {
  name: string;
  channel?: string;
  description: string;
  subscribers?: string;
  icon: string;
  url?: string;
  zone?: string;
  image?: string;
}

export interface Sponsor {
  name: string;
  description: string;
  icon: string;
  url?: string;
  booth?: string;
  image?: string;
  subscribers?: string;
}

export const creators: Creator[] = [
  {
    name: '水戸道楽TV',
    channel: '@mitodouraku',
    description: 'イベント主催。茨城を拠点に旧車・カスタムカー文化を発信する人気チャンネル。',
    subscribers: '11.8万人',
    icon: 'i-ph-star-duotone',
    url: 'https://www.youtube.com/@mitodouraku',
    zone: 'A',
    image: '/creators/mitodourakutv.svg',
  },
  {
    name: 'とよちゃんガレージ',
    channel: '@toyochan',
    description: '自動車整備・カスタムを楽しく分かりやすく紹介するチャンネル。',
    subscribers: '24万人',
    icon: 'i-ph-wrench-duotone',
    url: 'https://www.youtube.com/@toyochan',
    image: '/creators/toyochan.svg',
  },
  {
    name: 'シュンヤのガレージライフ',
    channel: '@shunyagl',
    description: 'ガレージでの車いじりを中心に、カーライフの魅力を発信。',
    subscribers: '20万人',
    icon: 'i-ph-garage-duotone',
    url: 'https://www.youtube.com/@shunyagl',
    image: '/creators/shunya.svg',
  },
  {
    name: '水島 翔',
    channel: '@ryoushitrader',
    description: '漁師トレーダー翔として活動。車・トレード・ライフスタイルを発信。',
    subscribers: '18.8万人',
    icon: 'i-ph-video-camera-duotone',
    url: 'https://www.youtube.com/@ryoushitrader',
    image: '/creators/mizushima.svg',
  },
  {
    name: '車の板金塗装レストアGT',
    channel: '@restoregt',
    description: '板金塗装・レストアの技術をプロの視点から発信。',
    subscribers: '20.1万人',
    icon: 'i-ph-paint-roller-duotone',
    url: 'https://www.youtube.com/@restoregt',
    image: '/creators/restoregt.svg',
  },
  {
    name: 'トイマンチーズ',
    channel: '@toymancheese',
    description: '独自の目線で車の魅力を伝えるカーエンタメチャンネル。',
    subscribers: '7.6万人',
    icon: 'i-ph-microphone-duotone',
    url: 'https://www.youtube.com/@toymancheese',
    image: '/creators/toimancheese.svg',
  },
  {
    name: 'うぃきちゃんねる',
    channel: '@wikichannel',
    description: '旧車・ネオクラシックカーを中心にカーライフを配信。',
    subscribers: '2.4万人',
    icon: 'i-ph-camera-duotone',
    url: 'https://www.youtube.com/@wikichannel',
    image: '/creators/wikichannel.svg',
  },
];

export const sponsors: Sponsor[] = [
  {
    name: '有限会社 小林製作所',
    description: '精密切削加工のスペシャリスト。イベント限定の切削サイコロノベルティ抽選会を開催!',
    icon: 'i-ph-gear-six-duotone',
    booth: '小林製作所ブース',
    image: '/sponsors/kobayashi.svg',
  },
  {
    name: 'GARAGE CRAFT',
    description: 'トータルカーサポート。車のカスタム・整備・板金塗装をワンストップで対応。',
    icon: 'i-ph-wrench-duotone',
    image: '/sponsors/garagecraft.svg',
  },
  {
    name: 'WORLD IMPORT TOOLS',
    description: '輸入工具の専門店。プロ仕様の工具を幅広く取り揃え。',
    icon: 'i-ph-toolbox-duotone',
    subscribers: '1.69万人',
    url: 'https://www.youtube.com/@w.i.t',
    image: '/sponsors/worldimporttools.svg',
  },
  {
    name: 'レンタカーズ SEIWA',
    description: 'レンタカーサービス。旧車・スポーツカーのレンタルも対応。',
    icon: 'i-ph-car-duotone',
    image: '/sponsors/seiwa.svg',
  },
  {
    name: 'トラスト企画',
    description: 'GT-R・スカイライン専門パーツショップ。純正・社外パーツを豊富に取り揃え。',
    icon: 'i-ph-storefront-duotone',
    subscribers: '15.6万人',
    url: 'https://www.youtube.com/@trustplanning',
    image: '/sponsors/trust.svg',
  },
];
