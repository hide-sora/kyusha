import { useState, useEffect, useCallback } from 'react';
import { getPb } from '../../lib/pb';
import { getDeviceId } from '../../lib/deviceId';

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  youtuber_name: string;
  start_price: number;
  current_price: number;
  status: 'upcoming' | 'live' | 'ended';
  start_time: string;
  image?: string;
}

interface Bid {
  id: string;
  amount: number;
  bidder_name: string;
  created: string;
}

function formatYen(n: number) {
  return `¥${n.toLocaleString()}`;
}

function ItemCard({
  item,
  isSelected,
  onSelect,
}: {
  item: AuctionItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusLabel = {
    upcoming: { text: '開始前', class: 'bg-surface-container-highest text-on-surface-variant' },
    live: { text: 'LIVE', class: 'bg-error text-on-error' },
    ended: { text: '終了', class: 'bg-surface-container-high text-on-surface-variant' },
  }[item.status];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl p-4 transition-all duration-200 card-press ${
        isSelected
          ? 'bg-surface-container-lowest shadow-[0_20px_40px_rgba(46,51,54,0.06)] ring-2 ring-primary/20'
          : 'bg-surface-container-low hover:bg-surface-container-lowest'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-surface-container-high flex-center shrink-0 overflow-hidden">
          <span className="i-ph-gavel-duotone text-2xl text-on-surface-variant/20" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-700 px-2 py-0.5 rounded-lg ${statusLabel.class}`}>
              {statusLabel.text}
            </span>
            <span className="text-[11px] text-on-surface-variant truncate">
              {item.youtuber_name}
            </span>
          </div>
          <h3 className="font-display font-700 text-sm text-on-surface truncate">{item.title}</h3>
          <p className="font-display font-800 text-primary text-lg mt-1">
            {formatYen(item.current_price || item.start_price)}
          </p>
        </div>
      </div>
    </button>
  );
}

function BidPanel({ item }: { item: AuctionItem }) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pb = getPb();

  useEffect(() => {
    pb.collection('auction_bids')
      .getList(1, 20, {
        filter: `item = "${item.id}"`,
        sort: '-amount',
      })
      .then(res => setBids(res.items as unknown as Bid[]))
      .catch(() => {});

    const unsub = pb.collection('auction_bids').subscribe('*', (e) => {
      if (e.action === 'create') {
        const bid = e.record as unknown as Bid;
        setBids(prev => [bid, ...prev].sort((a, b) => b.amount - a.amount).slice(0, 20));
      }
    });

    return () => { unsub.then(fn => fn()); };
  }, [item.id]);

  const handleBid = useCallback(async () => {
    setError('');
    const amount = parseInt(bidAmount);
    if (!amount || amount <= (item.current_price || item.start_price)) {
      setError(`現在の価格 ${formatYen(item.current_price || item.start_price)} より高い金額を入力してください`);
      return;
    }
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    setSubmitting(true);
    try {
      await pb.collection('auction_bids').create({
        item: item.id,
        amount,
        bidder_name: nickname.trim(),
        device_id: getDeviceId(),
      });
      setBidAmount('');
    } catch (e: any) {
      setError('入札に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  }, [bidAmount, nickname, item]);

  const minBid = (item.current_price || item.start_price) + 100;

  return (
    <div className="mt-4 space-y-4">
      {/* 現在の最高額 */}
      <div className="text-center py-5 bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(46,51,54,0.06)]">
        <p className="text-[10px] tracking-widest font-700 uppercase text-on-surface-variant mb-1">現在の最高額</p>
        <p className="font-display font-800 text-3xl text-on-surface">
          {formatYen(item.current_price || item.start_price)}
        </p>
      </div>

      {/* 入札フォーム */}
      {item.status === 'live' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="ニックネーム"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full bg-surface-container-highest rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            maxLength={20}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`${formatYen(minBid)}〜`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="flex-1 bg-surface-container-highest rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all tabular-nums"
              min={minBid}
              step={100}
            />
            <button
              onClick={handleBid}
              disabled={submitting}
              className="btn-primary px-5 shrink-0 disabled:opacity-50 text-sm"
            >
              {submitting ? '...' : '入札'}
            </button>
          </div>
          {/* クイック入札ボタン */}
          <div className="flex gap-2 flex-wrap">
            {[100, 500, 1000, 5000].map(inc => (
              <button
                key={inc}
                onClick={() => setBidAmount(String((item.current_price || item.start_price) + inc))}
                className="px-3 py-1.5 bg-surface-container-high rounded-xl text-xs font-600 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200 active:scale-90"
              >
                +{formatYen(inc)}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
      )}

      {item.status === 'upcoming' && (
        <div className="text-center py-6">
          <span className="i-ph-clock-countdown-duotone text-4xl text-on-surface-variant/20 block mb-2" />
          <p className="text-sm text-on-surface-variant">オークション開始までお待ちください</p>
        </div>
      )}

      {/* 入札履歴 */}
      {bids.length > 0 && (
        <div>
          <h4 className="text-[10px] font-700 text-on-surface-variant uppercase tracking-widest mb-2">入札履歴</h4>
          <div className="space-y-1.5">
            {bids.slice(0, 10).map((bid, i) => (
              <div
                key={bid.id}
                className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-sm ${
                  i === 0 ? 'bg-surface-container-lowest shadow-[0_10px_20px_rgba(46,51,54,0.04)] text-on-surface' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <span className="font-500">{bid.bidder_name}</span>
                <span className="font-display font-700 tabular-nums">{formatYen(bid.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuctionPage() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pb = getPb();

  useEffect(() => {
    pb.collection('auction_items')
      .getFullList({ sort: 'start_time' })
      .then(res => {
        const list = res as unknown as AuctionItem[];
        setItems(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const unsub = pb.collection('auction_items').subscribe('*', (e) => {
      if (e.action === 'update') {
        setItems(prev => prev.map(item =>
          item.id === e.record.id ? { ...item, ...e.record } as unknown as AuctionItem : item
        ));
      }
    });

    return () => { unsub.then(fn => fn()); };
  }, []);

  const selectedItem = items.find(i => i.id === selectedId);

  if (loading) {
    return (
      <div className="flex-center py-20">
        <span className="i-ph-spinner-bold text-2xl text-on-surface-variant animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-5 max-w-lg mx-auto">
        <div className="card-elevated text-center py-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-tertiary-fixed flex-center mb-5">
            <span className="i-ph-gavel-duotone text-3xl text-on-tertiary-fixed" />
          </div>
          <h2 className="font-display font-800 text-xl text-on-surface mb-2">
            チャリティーオークション
          </h2>
          <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">
            各YouTuberが用意したとっておきの出品物を<br />
            専用アプリでオークション!<br />
            参加は来場者全員可能です。
          </p>
          <div className="inline-flex items-center gap-2 bg-on-surface text-surface rounded-xl px-5 py-3 font-display font-700">
            <span className="i-ph-clock-countdown-duotone text-lg" />
            13:00 START
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 max-w-lg mx-auto space-y-3">
      {/* ヘッダー告知 */}
      <div className="bg-primary text-on-primary rounded-xl px-5 py-4 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-32 bg-white/5 skew-x-[-20deg] translate-x-12" />
        <span className="i-ph-megaphone-duotone text-2xl shrink-0 relative z-10" />
        <div className="relative z-10">
          <p className="font-display font-700 text-sm">チャリティーオークション開催中!</p>
          <p className="text-xs opacity-80">各YouTuberの出品物に入札できます</p>
        </div>
      </div>

      {/* 出品一覧 */}
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          onSelect={() => setSelectedId(item.id)}
        />
      ))}

      {/* 選択中のアイテム詳細 */}
      {selectedItem && <BidPanel item={selectedItem} />}
    </div>
  );
}
