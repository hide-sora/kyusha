export interface SpecItem {
  label: string;
  value: string;
}

export interface SubItem {
  title: string;
  description: string;
  icon?: string;
}

export interface ShowcaseItem {
  lot: number;
  title: string;
  subtitle?: string;
  /** カード用の短い説明 */
  description: string;
  /** 詳細ページ用の長い説明（改行可） */
  longDescription?: string;
  youtuber: string;
  startPrice: number;
  /** gradient bg per card */
  gradient: string;
  icon: string;
  images?: string[];
  /** スペック（年式・走行距離・ブランド等） */
  specs?: SpecItem[];
  /** セールスポイント（箇条書き） */
  highlights?: string[];
  /** セット商品の場合のサブアイテム */
  subItems?: SubItem[];
  /** コンディション・備考 */
  notes?: string[];
}

export const showcaseItems: ShowcaseItem[] = [
  {
    lot: 1,
    title: 'ジムニー JA11 & 自作テーブル',
    description: '水戸道楽TVから2品出品！リフトアップ＆RECAROシート装備のJA11ジムニーと、手作りテーブル。',
    longDescription:
      '水戸道楽TVからの大盤振る舞い！ 動画にも度々登場したJA11ジムニーをチャリティーオークションに出品します。\nさらに、水戸道楽TVオリジナルの手作りテーブルもセットで出品。唯一無二のコレクションアイテムです。',
    youtuber: '水戸道楽TV',
    startPrice: 0,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    icon: 'i-ph-car-profile-duotone',
    images: ['/auction/mito-jimny-1.jpg', '/auction/mito-jimny-2.jpg'],
    specs: [
      { label: '車種', value: 'スズキ ジムニー' },
      { label: '型式', value: 'JA11系' },
      { label: '駆動方式', value: 'パートタイム4WD' },
      { label: 'シート', value: 'RECARO装備' },
      { label: 'タイヤ', value: 'オフロードタイヤ' },
      { label: 'カスタム', value: 'リフトアップ' },
    ],
    highlights: [
      '水戸道楽TVの動画にも登場した本人車両',
      'オフロード走行にも耐える足回りカスタム済み',
      'RECAROシートで長距離も快適',
      '手作りテーブル付属（世界に一つだけの逸品）',
    ],
    subItems: [
      {
        title: 'JA11 ジムニー 本体',
        description: 'リフトアップ＆オフロードタイヤ、RECAROシート装備のカスタム済み車両',
        icon: 'i-ph-car-profile-duotone',
      },
      {
        title: '水戸道楽TV 自作テーブル',
        description: '水戸道楽TVが手作りしたオリジナルテーブル。世界に一つだけの逸品',
        icon: 'i-ph-armchair-duotone',
      },
    ],
    notes: [
      '名義変更・自賠責等の諸費用は落札者ご負担となります',
      '車検・整備状況は当日スタッフまでお問い合わせください',
      'テーブルはサイズ・仕様にバラつきがございます',
    ],
  },
  {
    lot: 2,
    title: 'マフラー・ホイール他パーツ',
    description: 'シュンヤのガレージライフから放出！柿本改マフラー、オルタネーター、オーバーフェンダーなど。',
    longDescription:
      'シュンヤのガレージライフから貴重なパーツをまとめて出品！ ガレージに眠っていたレアパーツを、チャリティーオークションで一斉放出します。\nマフラー、オルタネーター、オーバーフェンダーなど、カスタムカー乗りには堪らないラインナップ。単品入札も可能です。',
    youtuber: 'シュンヤのガレージライフ',
    startPrice: 0,
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d3a4a 100%)',
    icon: 'i-ph-garage-duotone',
    images: [
      '/auction/shunya-muffler-1.jpg',
      '/auction/shunya-muffler-2.jpg',
      '/auction/shunya-muffler-3.jpg',
      '/auction/shunya-alternator.jpg',
      '/auction/shunya-fender.jpg',
    ],
    highlights: [
      '柿本改マフラー（JASMA認定品）',
      'ARDリビルト オルタネーター（A-M090）',
      'オーバーフェンダー一式',
      '単品での入札も可能',
    ],
    subItems: [
      {
        title: '柿本改マフラー',
        description: 'JASMA認定の人気ブランド。状態良好。',
        icon: 'i-ph-fire-duotone',
      },
      {
        title: 'オルタネーター (A-M090)',
        description: 'ARDリビルト品。動作確認済み。',
        icon: 'i-ph-lightning-duotone',
      },
      {
        title: 'オーバーフェンダー',
        description: 'ワイドボディ化に必須のパーツ。',
        icon: 'i-ph-squares-four-duotone',
      },
    ],
    notes: [
      'ノークレーム・ノーリターンでお願いします',
      '適合車種は事前にご確認ください',
      'お渡しは会場にてとなります（大型パーツの配送はご相談）',
    ],
  },
  {
    lot: 3,
    title: 'フェアレディZ Z33',
    description: '水島翔の愛車！カスタムグラフィック＆ワイドボディのZ33。深リムホイール装着。',
    longDescription:
      '漁師トレーダー翔（水島翔）の愛車、日産フェアレディZ Z33をチャリティーオークションに出品！\nオリジナルのカスタムグラフィックラッピング、ワイドボディキット、深リムホイールと、一目で目を引くフルカスタム仕様。サーキット走行会でも映えること間違いなし。',
    youtuber: '水島 翔',
    startPrice: 8000000,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #1e293b 50%, #0f172a 100%)',
    icon: 'i-ph-steering-wheel-duotone',
    images: ['/auction/sho-z33-1.jpg', '/auction/sho-z33-2.jpg', '/auction/sho-z33-3.jpg'],
    specs: [
      { label: '車種', value: '日産 フェアレディZ' },
      { label: '型式', value: 'Z33' },
      { label: '外装', value: 'カスタムグラフィックラッピング' },
      { label: 'ボディ', value: 'ワイドボディキット装着' },
      { label: 'ホイール', value: '深リムカスタムホイール' },
      { label: '最低落札価格', value: '¥8,000,000' },
    ],
    highlights: [
      '漁師トレーダー翔の愛車（動画・SNS出演車両）',
      '他にない唯一無二のカスタムグラフィック',
      'ワイドボディ化＆深リム装着済み',
      'サーキット・展示会で注目度抜群',
    ],
    notes: [
      '最低落札価格は ¥8,000,000 です',
      '名義変更・自賠責・陸送費等は落札者ご負担',
      '現車確認は当日会場にて可能です',
    ],
  },
];
