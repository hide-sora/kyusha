import { useState, useEffect } from 'react';
import { getPb } from '../../lib/pb';

interface AuctionItem {
  id: string;
  title: string;
  youtuber_name: string;
  start_price: number;
  current_price: number;
  status: 'upcoming' | 'live' | 'ended';
}

interface Bid {
  id: string;
  item: string;
  amount: number;
  bidder_name: string;
  created: string;
}

function formatYen(n: number) {
  return `¥${n.toLocaleString()}`;
}

export default function AuctionBoard() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [latestBid, setLatestBid] = useState<Bid | null>(null);
  const [flash, setFlash] = useState(false);
  const pb = getPb();

  useEffect(() => {
    pb.collection('auction_items')
      .getFullList({ sort: 'start_time' })
      .then(res => setItems(res as unknown as AuctionItem[]))
      .catch(() => {});

    const unsubItems = pb.collection('auction_items').subscribe('*', (e) => {
      if (e.action === 'update') {
        setItems(prev => prev.map(item =>
          item.id === e.record.id ? { ...item, ...e.record } as unknown as AuctionItem : item
        ));
      } else if (e.action === 'create') {
        setItems(prev => [...prev, e.record as unknown as AuctionItem]);
      } else if (e.action === 'delete') {
        setItems(prev => prev.filter(item => item.id !== e.record.id));
      }
    });

    const unsubBids = pb.collection('auction_bids').subscribe('*', (e) => {
      if (e.action === 'create') {
        const bid = e.record as unknown as Bid;
        setLatestBid(bid);
        setFlash(true);
        setTimeout(() => setFlash(false), 1500);
      }
    });

    return () => {
      unsubItems.then(fn => fn());
      unsubBids.then(fn => fn());
    };
  }, []);

  const liveItem = items.find(i => i.status === 'live');
  const upcomingItems = items.filter(i => i.status === 'upcoming');
  const endedItems = items.filter(i => i.status === 'ended');

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex-center">
        <div className="text-center">
          <span className="i-ph-gavel-duotone text-6xl text-white/10 block mb-4" />
          <p className="font-display font-700 text-white/30 text-xl">オークション準備中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex flex-col">
      {/* LIVE アイテム */}
      {liveItem ? (
        <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${flash ? 'scale-[1.02]' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-display font-800 text-red-400 text-lg tracking-widest uppercase">LIVE</span>
          </div>

          <p className="text-white/50 text-lg font-600 mb-1">{liveItem.youtuber_name}</p>
          <h1 className="font-display font-800 text-3xl sm:text-5xl text-white text-center mb-8">
            {liveItem.title}
          </h1>

          <div className={`rounded-3xl px-12 py-8 sm:px-20 sm:py-12 transition-all duration-500 ${
            flash ? 'bg-amber-500/20 shadow-[0_0_80px_rgba(245,158,11,0.3)]' : 'bg-white/5'
          }`}>
            <p className="text-white/40 text-sm font-700 tracking-widest uppercase text-center mb-2">現在の最高額</p>
            <p className={`font-display font-800 text-6xl sm:text-8xl lg:text-[10rem] tabular-nums text-center leading-none transition-colors duration-500 ${
              flash ? 'text-amber-400' : 'text-white'
            }`}>
              {formatYen(liveItem.current_price || liveItem.start_price)}
            </p>
          </div>

          {latestBid && (
            <div className={`mt-6 transition-all duration-500 ${flash ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-0'}`}>
              <p className="text-white/40 text-center text-sm">
                最新入札: <span className="text-white font-700">{latestBid.bidder_name}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex-center">
          <div className="text-center">
            <span className="i-ph-gavel-duotone text-6xl text-white/10 block mb-4" />
            <p className="font-display font-700 text-white/30 text-xl">次の出品物をお待ちください</p>
          </div>
        </div>
      )}

      {/* 下部: 次の出品物 / 終了した出品物 */}
      {(upcomingItems.length > 0 || endedItems.length > 0) && (
        <div className="flex gap-4 flex-wrap justify-center pt-4 border-t border-white/5 mt-4">
          {upcomingItems.map(item => (
            <div key={item.id} className="bg-white/5 rounded-xl px-5 py-3 text-center min-w-[140px]">
              <p className="text-[10px] text-white/30 font-700 tracking-widest uppercase mb-1">次</p>
              <p className="font-display font-700 text-sm text-white/70">{item.title}</p>
              <p className="text-white/30 text-xs">{formatYen(item.start_price)}〜</p>
            </div>
          ))}
          {endedItems.map(item => (
            <div key={item.id} className="bg-white/5 rounded-xl px-5 py-3 text-center min-w-[140px] opacity-50">
              <p className="text-[10px] text-white/30 font-700 tracking-widest uppercase mb-1">終了</p>
              <p className="font-display font-700 text-sm text-white/50">{item.title}</p>
              <p className="text-amber-400/50 text-xs font-700">{formatYen(item.current_price || item.start_price)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
