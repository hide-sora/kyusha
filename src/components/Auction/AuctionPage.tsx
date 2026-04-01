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

// 金額フォーマット
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
    upcoming: { text: '開始前', class: 'bg-secondary text-muted-foreground' },
    live: { text: 'LIVE', class: 'bg-red-500/90 text-white' },
    ended: { text: '終了', class: 'bg-muted text-muted-foreground' },
  }[item.status];

  return (
    <button
      onClick={onSelect}
      className={`card-base w-full text-left transition-all ${
        isSelected ? 'border-primary ring-1 ring-primary/30' : 'hover:border-primary/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 画像プレースホルダー */}
        <div className="w-16 h-16 rounded-lg bg-secondary flex-center shrink-0 overflow-hidden">
          <span className="i-ph-gavel-duotone text-2xl text-muted-foreground/30" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-md ${statusLabel.class}`}>
              {statusLabel.text}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {item.youtuber_name}
            </span>
          </div>
          <h3 className="font-700 text-sm text-foreground truncate">{item.title}</h3>
          <p className="font-display font-700 text-primary text-lg mt-1">
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

  // リアルタイム入札情報取得
  useEffect(() => {
    // 既存の入札を取得
    pb.collection('auction_bids')
      .getList(1, 20, {
        filter: `item = "${item.id}"`,
        sort: '-amount',
      })
      .then(res => setBids(res.items as unknown as Bid[]))
      .catch(() => {});

    // リアルタイム購読
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
      <div className="text-center py-4 bg-primary/5 rounded-card border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">現在の最高額</p>
        <p className="font-display font-900 text-3xl text-primary">
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
            className="w-full bg-secondary border border-border rounded-button px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            maxLength={20}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`${formatYen(minBid)}〜`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="flex-1 bg-secondary border border-border rounded-button px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors tabular-nums"
              min={minBid}
              step={100}
            />
            <button
              onClick={handleBid}
              disabled={submitting}
              className="btn-primary px-5 shrink-0 disabled:opacity-50"
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
                className="px-3 py-1.5 bg-secondary border border-border rounded-button text-xs font-600 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                +{formatYen(inc)}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}

      {item.status === 'upcoming' && (
        <div className="text-center py-6">
          <span className="i-ph-clock-countdown-duotone text-4xl text-muted-foreground/30 block mb-2" />
          <p className="text-sm text-muted-foreground">オークション開始までお待ちください</p>
        </div>
      )}

      {/* 入札履歴 */}
      {bids.length > 0 && (
        <div>
          <h4 className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">入札履歴</h4>
          <div className="space-y-1">
            {bids.slice(0, 10).map((bid, i) => (
              <div
                key={bid.id}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm ${
                  i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
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

    // リアルタイムで status / current_price を更新
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
        <span className="i-ph-spinner-bold text-2xl text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 max-w-lg mx-auto">
        {/* オークション告知（出品未登録時） */}
        <div className="card-base text-center py-10 bg-gradient-to-br from-amber-600/10 to-orange-600/10">
          <span className="i-ph-gavel-duotone text-6xl text-primary block mb-4" />
          <h2 className="font-display font-700 text-xl text-foreground mb-2">
            チャリティーオークション
          </h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            各YouTuberが用意したとっておきの出品物を<br />
            専用アプリでオークション!<br />
            参加は会場者全員可能です。
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-pill px-4 py-2">
            <span className="i-ph-clock-countdown-duotone text-primary text-lg" />
            <span className="font-display font-700 text-primary text-lg">13:00 START</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 max-w-lg mx-auto space-y-3">
      {/* ヘッダー告知 */}
      <div className="bg-primary/10 border border-primary/30 rounded-card px-4 py-3 flex items-center gap-3">
        <span className="i-ph-megaphone-duotone text-2xl text-primary shrink-0" />
        <div>
          <p className="font-700 text-sm text-primary">チャリティーオークション開催中!</p>
          <p className="text-xs text-muted-foreground">各YouTuberの出品物に入札しよう</p>
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
