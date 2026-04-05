export interface Zone {
  id: string;
  name: string;
  description: string;
  carCount: number;
  color: string;
}

export const zones: Zone[] = [
  {
    id: 'A',
    name: 'Aゾーン',
    description: '水戸道楽TV ゆかりの車両',
    carCount: 50,
    color: '#e63946',
  },
  {
    id: 'B',
    name: 'Bゾーン',
    description: '日産スカイライン',
    carCount: 25,
    color: '#457b9d',
  },
  {
    id: 'C',
    name: 'Cゾーン',
    description: '一般旧車系 (〜1989年)',
    carCount: 87,
    color: '#2a9d8f',
  },
  {
    id: '茨',
    name: '茨城友の会',
    description: 'ホンダS660を中心としたコミュニティー',
    carCount: 0,
    color: '#7c3aed',
  },
  {
    id: 'D',
    name: 'Dゾーン',
    description: 'ネオクラシックカー・ファミリーカー (1990年〜)',
    carCount: 71,
    color: '#e9c46a',
  },
  {
    id: 'E',
    name: 'Eゾーン',
    description: 'スーパーカー・輸入車',
    carCount: 14,
    color: '#f4a261',
  },
];
