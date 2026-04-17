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
  /** 参考価格（通常流通価格の目安） */
  retailValue?: string;
  /** 一覧・詳細から非表示にする */
  hidden?: boolean;
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
    hidden: true,
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
    title: 'RX-7 カスタムパーツ 3点セット',
    subtitle: 'MAZDA RX-7 PARTS BUNDLE',
    description: 'シュンヤのガレージライフから！RX-7用マフラー・オルタネーター・オーバーフェンダーの3点まとめてセット。',
    longDescription:
      'シュンヤのガレージライフから、マツダ RX-7 用の人気カスタム＆メンテパーツを3点まとめてチャリティーオークションに出品！\n\n・柿本改マフラー（JASMA認定）\n・ARD リビルト オルタネーター A-M090（動作確認済み）\n・オーバーフェンダー一式（ワイドボディ化用）\n\nRX-7 オーナーが揃えたいパーツを一気に手に入れられる、お得なバンドル出品です。\n\n通常、新品・中古で揃えると合計 ¥250,000〜¥350,000 相当のパーツを、最低落札価格 ¥50,000 からスタート！',
    youtuber: 'シュンヤのガレージライフ',
    startPrice: 50000,
    retailValue: '約 ¥250,000〜¥350,000 相当',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d3a4a 100%)',
    icon: 'i-ph-package-duotone',
    images: [
      '/auction/shunya-muffler-1.jpg',
      '/auction/shunya-alternator.jpg',
      '/auction/shunya-fender.jpg',
      '/auction/shunya-muffler-2.jpg',
      '/auction/shunya-muffler-3.jpg',
    ],
    specs: [
      { label: '適合車種', value: 'マツダ RX-7' },
      { label: 'セット内容', value: 'マフラー + オルタネーター + フェンダー' },
      { label: '参考合計価格', value: '約 ¥250,000〜¥350,000 相当' },
      { label: '最低落札価格', value: '¥50,000' },
    ],
    highlights: [
      'RX-7 カスタム＆メンテに必須の人気パーツ3点セット',
      '柿本改マフラー（JASMA認定ブランド）',
      'ARD リビルト オルタネーター A-M090（動作確認済み）',
      'ワイドボディ化に必須のオーバーフェンダー一式',
      '単品で揃えると合計 約¥250,000〜¥350,000 相当',
    ],
    subItems: [
      {
        title: '柿本改マフラー',
        description: 'マツダ RX-7 用、JASMA認定の人気ブランド「柿本改」マフラー。状態良好。',
        icon: 'i-ph-fire-duotone',
      },
      {
        title: 'オルタネーター A-M090',
        description: 'ARD リビルト品、動作確認済み。交換・予備パーツに最適。',
        icon: 'i-ph-lightning-duotone',
      },
      {
        title: 'オーバーフェンダー一式',
        description: 'RX-7 のワイドボディ化に必須。カスタム製作中の方におすすめ。',
        icon: 'i-ph-squares-four-duotone',
      },
    ],
    notes: [
      '3点セットでの出品です（バラ売り不可）',
      'マツダ RX-7 用です',
      'ノークレーム・ノーリターンでお願いします',
      'お渡しは会場にてとなります（大型パーツの配送はご相談）',
      '最低落札価格は ¥50,000 です',
    ],
  },
  {
    lot: 4,
    title: 'フェアレディZ Z33',
    subtitle: 'TOKYO DRIFT "DK" SPEC',
    description: '水島翔の愛車！映画「ワイルドスピードX3 TOKYO DRIFT」のDK（タカシ）車と同型のZ33。ヴェイルサイド風エアロ＆ワイドボディ仕様。',
    longDescription:
      '漁師トレーダー翔（水島翔）の愛車、日産フェアレディZ Z33をチャリティーオークションに出品！\n\n映画「ワイルドスピードX3 TOKYO DRIFT」でDK（タカシ）が駆った車両と同型の Z33 をベースに、ヴェイルサイド風のエアロパーツ、ワイドボディキット、バイナルグラフィック、深リムホイール、大型リヤウイングと、劇中車を彷彿とさせるフルカスタム仕様に仕上げた一台です。\n\nオリジナルのカスタムグラフィックラッピングをまとい、サーキット走行会・カーショー・SNS映え、どのシーンでも視線を独り占めする唯一無二のビルドです。',
    youtuber: '水島 翔',
    startPrice: 8000000,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #1e293b 50%, #0f172a 100%)',
    icon: 'i-ph-steering-wheel-duotone',
    images: ['/auction/sho-z33-1.jpg', '/auction/sho-z33-2.jpg', '/auction/sho-z33-3.jpg'],
    specs: [
      { label: '車種', value: '日産 フェアレディZ' },
      { label: '型式', value: 'Z33' },
      { label: 'コンセプト', value: '映画「TOKYO DRIFT」DK車 同型ベース' },
      { label: '外装', value: 'ヴェイルサイド風エアロ＋カスタムグラフィック' },
      { label: 'ボディ', value: 'ワイドボディキット装着' },
      { label: 'ホイール', value: '深リムカスタムホイール' },
      { label: '最低落札価格', value: '¥8,000,000' },
    ],
    highlights: [
      '映画「ワイルドスピードX3 TOKYO DRIFT」DK（タカシ）車と同型のZ33',
      'ヴェイルサイド風エアロ＋大型リヤウイングで劇中車の雰囲気を再現',
      '漁師トレーダー翔の愛車（動画・SNS出演車両）',
      '他にない唯一無二のカスタムグラフィックラッピング',
      'ワイドボディ化＆深リムホイール装着済み',
      'サーキット・カーショー・SNSで注目度抜群',
    ],
    notes: [
      '最低落札価格は ¥8,000,000 です',
      '名義変更・自賠責・陸送費等は落札者ご負担',
      '現車確認は当日会場にて可能です',
    ],
  },
  {
    lot: 5,
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
