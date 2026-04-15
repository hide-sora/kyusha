export interface FeaturedCar {
  zone: string;
  zoneColor: string;
  carName: string;
  owner: string;
  description: string;
  gradient: string;
}

export const featuredCars: FeaturedCar[] = [
  {
    zone: 'A',
    zoneColor: '#e63946',
    carName: '注目車両 準備中',
    owner: '水戸道楽TV ゆかりの車両',
    description: '詳細は近日公開！当日をお楽しみに',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b30 50%, #3d1c33 100%)',
  },
  {
    zone: 'B',
    zoneColor: '#457b9d',
    carName: '注目車両 準備中',
    owner: '日産スカイライン GT-R',
    description: 'R32・R33・R34が集結。詳細は近日公開！',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #1a2744 100%)',
  },
  {
    zone: 'C',
    zoneColor: '#2a9d8f',
    carName: '注目車両 準備中',
    owner: '一般旧車 (〜1989年)',
    description: '国産旧車の名車たち。詳細は近日公開！',
    gradient: 'linear-gradient(135deg, #0a1f1c 0%, #132e2a 50%, #1a3530 100%)',
  },
  {
    zone: 'D',
    zoneColor: '#e9c46a',
    carName: '注目車両 準備中',
    owner: 'ネオクラシック・ファミリー (1990年〜)',
    description: '90年代以降の名車。詳細は近日公開！',
    gradient: 'linear-gradient(135deg, #1c1917 0%, #292218 50%, #2d2510 100%)',
  },
  {
    zone: 'E',
    zoneColor: '#f4a261',
    carName: '注目車両 準備中',
    owner: 'スーパーカー・輸入車',
    description: '圧巻のスーパーカーたち。詳細は近日公開！',
    gradient: 'linear-gradient(135deg, #1a1510 0%, #251d14 50%, #2d2218 100%)',
  },
];
