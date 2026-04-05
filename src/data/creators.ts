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
    channel: '@mito.douraku',
    description: 'イベント主催。茨城を拠点に旧車・カスタムカー文化を発信する人気チャンネル。',
    subscribers: '14.1万人',
    icon: 'i-ph-star-duotone',
    url: 'https://www.youtube.com/@mito.douraku',
    zone: 'A',
    image: '/creators/mitodourakutv.jpg',
  },
  {
    name: 'とよちゃんガレージ',
    channel: '@toyochan',
    description: '自動車整備・カスタムを楽しく分かりやすく紹介するチャンネル。',
    subscribers: '24万人',
    icon: 'i-ph-wrench-duotone',
    url: 'https://www.youtube.com/@toyochan',
    image: '/creators/toyochan.jpg',
  },
  {
    name: 'シュンヤのガレージライフ',
    channel: '@shunyagl0413',
    description: 'ガレージでの車いじりを中心に、カーライフの魅力を発信。',
    subscribers: '22.3万人',
    icon: 'i-ph-garage-duotone',
    url: 'https://www.youtube.com/@shunyagl0413',
    image: '/creators/shunya.jpg',
  },
  {
    name: '水島 翔',
    channel: '@fxryoushi-trader8482',
    description: '漁師トレーダー翔として活動。車・トレード・ライフスタイルを発信。',
    subscribers: '18.8万人',
    icon: 'i-ph-video-camera-duotone',
    url: 'https://www.youtube.com/@fxryoushi-trader8482',
    image: '/creators/mizushima.jpg',
  },
  {
    name: '車の板金塗装レストアGT',
    channel: '@restoregt',
    description: '板金塗装・レストアの技術をプロの視点から発信。',
    subscribers: '20.1万人',
    icon: 'i-ph-paint-roller-duotone',
    url: 'https://www.youtube.com/@restoregt',
    image: '/creators/restoregt.jpg',
  },
  {
    name: 'トイマンチーズ',
    channel: '@toymancheese',
    description: '独自の目線で車の魅力を伝えるカーエンタメチャンネル。',
    subscribers: '9.65万人',
    icon: 'i-ph-microphone-duotone',
    url: 'https://www.youtube.com/@toymancheese',
    image: '/creators/toimancheese.svg',
  },
  {
    name: 'うぃきちゃんねる',
    channel: '@wiki.channel',
    description: '旧車・ネオクラシックカーを中心にカーライフを配信。',
    subscribers: '10.6万人',
    icon: 'i-ph-camera-duotone',
    url: 'https://www.youtube.com/@wiki.channel',
    image: '/creators/wikichannel.jpg',
  },
];

export const sponsors: Sponsor[] = [
  {
    name: '有限会社 小林製作所',
    description: '茨城県ひたちなか市の、加工マイスターがいる切削加工会社。昨年に続きイベント限定の切削サイコロノベルティ抽選会を開催します',
    icon: 'i-ph-gear-six-duotone',
    url: 'https://www.youtube.com/watch?v=bUZtmi6SIqQ',
    booth: '小林製作所ブース',
    image: '/sponsors/kobayashi.png',
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
    image: '/sponsors/worldimporttools.jpg',
  },
  {
    name: 'レンタカーズ SEiWA',
    description: 'レンタカーサービス。旧車・スポーツカーのレンタルも対応。',
    icon: 'i-ph-car-duotone',
    url: 'https://seiwa-rc.jp',
    image: '/sponsors/seiwa.svg',
  },
  {
    name: 'トラスト企画',
    description: 'GT-R・スカイライン専門パーツショップ。純正・社外パーツを豊富に取り揃え。',
    icon: 'i-ph-storefront-duotone',
    subscribers: '15.6万人',
    url: 'https://www.youtube.com/@trustkikaku',
    image: '/sponsors/trust.jpg',
  },
];
