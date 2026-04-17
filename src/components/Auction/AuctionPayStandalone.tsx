import { useState, useEffect } from 'react';
import { getPb } from '../../lib/pb';
import AuctionPayment from './AuctionPayment';

interface AuctionItem {
  id: string;
  title: string;
  youtuber_name: string;
  current_price: number;
  start_price: number;
  status: 'upcoming' | 'live' | 'ended';
}

interface Props {
  itemId: string;
}

export default function AuctionPayStandalone({ itemId }: Props) {
  const [item, setItem] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  useEffect(() => {
    const pb = getPb();

    pb.collection('auction_items')
      .getOne(itemId)
      .then(res => setItem(res as unknown as AuctionItem))
      .catch(err => {
        if (err?.status === 404) setError('アイテムが見つかりません');
        else setError('情報の取得に失敗しました');
      })
      .finally(() => setLoading(false));

    // 既に支払い済みかチェック
    pb.collection('auction_payments')
      .getFirstListItem(`item="${itemId}"`)
      .then(() => setAlreadyPaid(true))
      .catch(() => {});
  }, [itemId]);

  if (loading) {
    return (
      <div className="card-elevated flex-center py-16">
        <span className="i-ph-spinner-bold text-2xl text-on-surface-variant animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="card-elevated text-center py-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-error/10 flex-center mb-4">
          <span className="i-ph-warning-circle-duotone text-3xl text-error" />
        </div>
        <p className="font-display font-700 text-base text-on-surface mb-1">
          {error || 'アイテムが見つかりません'}
        </p>
        <p className="text-xs text-on-surface-variant">
          リンクが正しいかご確認ください。
        </p>
      </div>
    );
  }

  if (item.status !== 'ended') {
    return (
      <div className="card-elevated text-center py-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex-center mb-4">
          <span className="i-ph-clock-countdown-duotone text-3xl text-amber-500" />
        </div>
        <p className="font-display font-700 text-base text-on-surface mb-1">
          {item.status === 'live' ? 'オークション進行中' : 'オークション開始前'}
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          オークション終了後にお支払い可能になります。<br />
          しばらく経ってから再度アクセスしてください。
        </p>
      </div>
    );
  }

  if (alreadyPaid) {
    return (
      <div className="card-elevated text-center py-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-secondary-container flex-center mb-4">
          <span className="i-ph-check-circle-duotone text-3xl text-secondary" />
        </div>
        <p className="font-display font-700 text-base text-on-surface mb-1">
          お支払い済みです
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {item.title}<br />
          ご協力ありがとうございました。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="i-ph-trophy-duotone text-lg text-amber-500" />
          <p className="text-[10px] tracking-widest uppercase font-700 text-amber-500">
            WINNING BID / 落札者様
          </p>
        </div>
        <h1 className="font-display font-800 text-2xl text-on-surface leading-tight mb-1">
          {item.title}
        </h1>
        <p className="text-xs text-on-surface-variant mb-3">
          {item.youtuber_name}
        </p>
        <div className="border-t border-outline-variant/20 pt-3 flex items-end justify-between">
          <span className="text-xs text-on-surface-variant">落札金額</span>
          <span className="font-display font-800 text-3xl text-on-surface tabular-nums">
            ¥{(item.current_price || item.start_price).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 支払いUI */}
      <div className="card-elevated p-5">
        <AuctionPayment
          itemId={item.id}
          itemTitle={item.title}
          amount={item.current_price || item.start_price}
        />
      </div>

      {/* 案内 */}
      <div className="bg-surface-container-low rounded-xl p-4">
        <p className="text-[10px] font-700 text-on-surface-variant tracking-widest uppercase mb-1.5 flex items-center gap-1">
          <span className="i-ph-info-duotone text-sm" />
          お支払いについて
        </p>
        <ul className="text-[11px] text-on-surface-variant leading-relaxed space-y-1 list-none">
          <li>クレジットカード・PayPay・銀行振込からお選びいただけます</li>
          <li>ご不明点は会場スタッフまでお問い合わせください</li>
          <li>収益はチャリティーとして寄付されます</li>
        </ul>
      </div>
    </div>
  );
}
