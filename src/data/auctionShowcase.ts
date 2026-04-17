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
    title: 'ジムニー JA11',
    description: '水戸道楽TVの愛車！リフトアップ＆RECAROシート装備のJA11ジムニー。',
    longDescription:
      '水戸道楽TVの愛車、スズキ ジムニー JA11 をチャリティーオークションに出品！\n動画にも度々登場した本人車両です。リフトアップ＆オフロードタイヤ、RECAROシート装備のカスタム済み仕様で、本格オフロード走行にも対応します。',
    youtuber: '水戸道楽TV',
    startPrice: 1,
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
      '本格4WDオフローダー',
    ],
    notes: [
      '名義変更・自賠責等の諸費用は落札者ご負担となります',
      '車検・整備状況は当日スタッフまでお問い合わせください',
      '現車確認は当日会場にて可能です',
    ],
  },
  {
    lot: 2,
    title: '水戸道楽TV 自作テーブル',
    subtitle: 'HANDMADE',
    description: '水戸道楽TVが手作りしたオリジナルテーブル。世界に一つだけの逸品。',
    longDescription:
      '水戸道楽TVが一から手作りしたオリジナルテーブルをチャリティーオークションに出品！\nガレージや書斎、リビングのアクセントにぴったりな、世界に一つだけのハンドメイドアイテムです。ファンなら見逃せないコレクターズピース。',
    youtuber: '水戸道楽TV',
    startPrice: 1,
    gradient: 'linear-gradient(135deg, #2d1b0e 0%, #3d2817 50%, #4a3120 100%)',
    icon: 'i-ph-armchair-duotone',
    highlights: [
      '水戸道楽TVが制作したハンドメイド作品',
      '世界に一つだけのコレクターズアイテム',
      'ガレージ・書斎・リビングのアクセントに',
      '収益は全額チャリティーに',
    ],
    notes: [
      'サイズ・仕様は一点物となります。詳細は当日会場にてご確認ください',
      '配送についてはご相談ください（会場でのお渡しが基本です）',
    ],
  },
  {
    lot: 3,
    title: '柿本改マフラー',
    subtitle: 'KAKIMOTO RACING',
    description: 'シュンヤのガレージライフから！マツダ RX-7用、JASMA認定の柿本改マフラー。',
    longDescription:
      'シュンヤのガレージライフから、マツダ RX-7用の「柿本改」マフラーをチャリティーオークションに出品！\nJASMA認定の人気ブランド。ガレージに眠っていたレアパーツで、RX-7オーナーには堪らない逸品です。',
    youtuber: 'シュンヤのガレージライフ',
    startPrice: 1,
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d3a4a 100%)',
    icon: 'i-ph-fire-duotone',
    images: [
      '/auction/shunya-muffler-1.jpg',
      '/auction/shunya-muffler-2.jpg',
      '/auction/shunya-muffler-3.jpg',
    ],
    specs: [
      { label: '適合車種', value: 'マツダ RX-7' },
      { label: 'ブランド', value: '柿本改' },
      { label: '認定', value: 'JASMA認定' },
    ],
    highlights: [
      'マツダ RX-7用マフラー',
      'JASMA認定の人気ブランド「柿本改」',
      '状態良好',
      'RX-7オーナーには堪らない逸品',
    ],
    notes: [
      'マツダ RX-7用です',
      'ノークレーム・ノーリターンでお願いします',
      'お渡しは会場にてとなります（配送はご相談）',
    ],
  },
  {
    lot: 4,
    title: 'オルタネーター A-M090',
    subtitle: 'ARD REBUILT',
    description: 'シュンヤのガレージライフから！マツダ RX-7用、ARDリビルトのオルタネーター。動作確認済み。',
    longDescription:
      'シュンヤのガレージライフから、マツダ RX-7用のARDリビルトオルタネーター「A-M090」をチャリティーオークションに出品！\n動作確認済みで、RX-7の交換・予備パーツとしてお使いいただけます。',
    youtuber: 'シュンヤのガレージライフ',
    startPrice: 1,
    gradient: 'linear-gradient(135deg, #1b1b2f 0%, #2d2d4a 50%, #3d3d5c 100%)',
    icon: 'i-ph-lightning-duotone',
    images: ['/auction/shunya-alternator.jpg'],
    specs: [
      { label: '適合車種', value: 'マツダ RX-7' },
      { label: '型番', value: 'A-M090' },
      { label: 'メーカー', value: 'ARD' },
      { label: '種別', value: 'リビルト品' },
    ],
    highlights: [
      'マツダ RX-7用オルタネーター',
      'ARDリビルト品',
      '動作確認済み',
      '交換・予備パーツに最適',
    ],
    notes: [
      'マツダ RX-7用です',
      'ノークレーム・ノーリターンでお願いします',
      'お渡しは会場にてとなります（配送はご相談）',
    ],
  },
  {
    lot: 5,
    title: 'オーバーフェンダー一式',
    description: 'シュンヤのガレージライフから！マツダ RX-7用、ワイドボディ化に必須のオーバーフェンダー一式。',
    longDescription:
      'シュンヤのガレージライフから、マツダ RX-7用のオーバーフェンダー一式をチャリティーオークションに出品！\nRX-7のワイドボディ化に必須のパーツ。カスタム製作中の方、ワイド化を目指す方におすすめです。',
    youtuber: 'シュンヤのガレージライフ',
    startPrice: 1,
    gradient: 'linear-gradient(135deg, #141824 0%, #263142 50%, #3a4456 100%)',
    icon: 'i-ph-squares-four-duotone',
    images: ['/auction/shunya-fender.jpg'],
    specs: [
      { label: '適合車種', value: 'マツダ RX-7' },
    ],
    highlights: [
      'マツダ RX-7用オーバーフェンダー',
      'ワイドボディ化に必須のパーツ',
      'カスタム製作中の方におすすめ',
      '一式まとめての出品',
    ],
    notes: [
      'マツダ RX-7用です',
      'ノークレーム・ノーリターンでお願いします',
      'お渡しは会場にてとなります（大型パーツの配送はご相談）',
    ],
  },
  {
    lot: 6,
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
  {
    lot: 7,
    title: 'ホンダ フォルツァ',
    subtitle: 'HONDA FORZA',
    description: 'SEiWAさんから出品！ブラックボディのホンダ フォルツァ。ビッグスクーターの定番モデル。',
    longDescription:
      'SEiWAさんから、ホンダ フォルツァをチャリティーオークションに出品！\nブラックのスタイリッシュなボディに、キルティングシート装備。ビッグスクーターの王道モデルで、通勤からツーリングまで幅広く活躍します。',
    youtuber: 'SEiWA',
    startPrice: 1,
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #2d2d3d 100%)',
    icon: 'i-ph-motorcycle-duotone',
    images: [
      '/auction/seiwa-forza-1.jpg',
      '/auction/seiwa-forza-2.jpg',
      '/auction/seiwa-forza-3.jpg',
      '/auction/seiwa-forza-4.jpg',
    ],
    specs: [
      { label: '車種', value: 'ホンダ フォルツァ' },
      { label: '型式', value: 'MF08' },
      { label: 'カラー', value: 'ブラック' },
      { label: 'シート', value: 'キルティングシート' },
    ],
    highlights: [
      'SEiWAさんからの出品',
      'ブラックボディのスタイリッシュな外観',
      'ビッグスクーターの王道・フォルツァ',
      '通勤からツーリングまで幅広く活躍',
    ],
    notes: [
      '名義変更・自賠責等の諸費用は落札者ご負担となります',
      '現車確認は当日会場にて可能です',
      'ノークレーム・ノーリターンでお願いします',
    ],
  },
];
