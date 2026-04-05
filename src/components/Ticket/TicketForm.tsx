import { useState, useEffect, useRef, useCallback } from 'react';
import { getPb } from '../../lib/pb';

declare global {
  interface Window {
    Square?: any;
  }
}

const ADVANCE_CAR_STOCK = 93;

type TicketType = 'advance_car' | 'advance_general' | 'day_general';
type Step = 'select' | 'info' | 'payment' | 'success';

interface TicketConfig {
  type: TicketType;
  label: string;
  sublabel: string;
  price: number;
  unit: string;
  badge: string;
  badgeClass: string;
  hasQuantity: boolean;
}

const ALL_TICKETS: TicketConfig[] = [
  {
    type: 'advance_car',
    label: '展示車両チケット',
    sublabel: '同乗者3名まで無料',
    price: 8000,
    unit: '台',
    badge: '前売り',
    badgeClass: 'bg-amber-400/15 text-amber-600',
    hasQuantity: false,
  },
  {
    type: 'advance_general',
    label: '一般入場（前売り）',
    sublabel: 'もてぎ入場料・駐車場代込み',
    price: 1500,
    unit: '人',
    badge: '前売り',
    badgeClass: 'bg-amber-400/15 text-amber-600',
    hasQuantity: true,
  },
  {
    type: 'day_general',
    label: '一般入場（当日）',
    sublabel: 'もてぎ入場料・駐車場代込み',
    price: 2500,
    unit: '人',
    badge: '当日',
    badgeClass: 'bg-surface-container-high text-on-surface-variant',
    hasQuantity: true,
  },
];

interface Props {
  isAdvanceSale: boolean;
}

export default function TicketForm({ isAdvanceSale }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [childQuantity, setChildQuantity] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sqLoading, setSqLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [remainingCar, setRemainingCar] = useState<number | null>(null);

  const cardRef = useRef<any>(null);

  // 4/20まで: 展示車両 + 一般前売り / 4/21から: 一般入場（当日）のみ
  const tickets = ALL_TICKETS.filter(t => {
    if (t.type === 'advance_car') return isAdvanceSale;
    if (t.type === 'advance_general') return isAdvanceSale;
    if (t.type === 'day_general') return !isAdvanceSale;
    return false;
  });
  const selectedTicket = tickets.find(t => t.type === ticketType);
  const total = selectedTicket ? selectedTicket.price * quantity : 0;

  // 展示車両チケット残枚数をPocketBaseから取得・購読
  useEffect(() => {
    if (!isAdvanceSale) return;
    const pb = getPb();

    async function fetchStock() {
      try {
        const result = await pb.collection('ticket_purchases').getList(1, 1, {
          filter: 'ticket_type = "advance_car"',
          fields: 'id',
        });
        setRemainingCar(Math.max(0, ADVANCE_CAR_STOCK - result.totalItems));
      } catch {
        setRemainingCar(ADVANCE_CAR_STOCK);
      }
    }

    fetchStock();
    const unsub = pb.collection('ticket_purchases').subscribe('*', fetchStock);
    return () => { unsub.then(fn => fn()); };
  }, [isAdvanceSale]);

  // Square Web Payments SDK のロード & アタッチ
  useEffect(() => {
    if (step !== 'payment') return;

    const appId = import.meta.env.PUBLIC_SQUARE_APP_ID;
    const locationId = import.meta.env.PUBLIC_SQUARE_LOCATION_ID;

    if (!appId || !locationId) {
      setError('決済設定が完了していません。管理者にお問い合わせください。');
      setSqLoading(false);
      return;
    }

    let cancelled = false;

    async function initSquare() {
      setSqLoading(true);

      // Square SDK スクリプトのロード
      if (!window.Square) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src =
            import.meta.env.PUBLIC_SQUARE_ENV === 'production'
              ? 'https://web.squarecdn.com/v1/square.js'
              : 'https://sandbox.web.squarecdn.com/v1/square.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Square SDK の読み込みに失敗しました'));
          document.head.appendChild(script);
        });
      }

      if (cancelled) return;

      const payments = window.Square.payments(appId, locationId);
      const card = await payments.card({
        style: {
          '.input-container': {
            borderColor: '#dfe3e7',
            borderRadius: '12px',
          },
          '.input-container.is-focus': {
            borderColor: '#2e3336',
          },
          '.input-container.is-error': {
            borderColor: '#a83836',
          },
          '.message-text': {
            color: '#a83836',
            fontSize: '11px',
          },
          input: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '15px',
            color: '#2e3336',
          },
          '::placeholder': {
            color: '#aeb2b6',
          },
        },
      });

      await card.attach('#square-card');

      if (!cancelled) {
        cardRef.current = card;
        setSqLoading(false);
      }
    }

    initSquare().catch(err => {
      if (!cancelled) {
        setError(err.message || 'カードフォームの読み込みに失敗しました');
        setSqLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
    };
  }, [step]);

  const handlePayment = useCallback(async () => {
    if (!cardRef.current || loading) return;
    setLoading(true);
    setError('');

    try {
      const tokenResult = await cardRef.current.tokenize();

      if (tokenResult.status !== 'OK') {
        const msg =
          tokenResult.errors?.[0]?.message ||
          'カード情報の確認に失敗しました';
        setError(msg);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          ticketType,
          quantity,
          childQuantity,
          name,
          email,
          amount: total,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'お支払いに失敗しました。もう一度お試しください。');
        setLoading(false);
        return;
      }

      setOrderId(data.orderId || '');
      setStep('success');
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。');
      setLoading(false);
    }
  }, [loading, ticketType, quantity, childQuantity, name, email, total]);

  // ── 完了画面 ──────────────────────────────────
  if (step === 'success') {
    return (
      <div className="card-elevated text-center py-8 px-4 animate-scaleIn">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex-center mx-auto mb-4">
          <span className="i-ph-check-circle-duotone text-4xl text-secondary" />
        </div>
        <h2 className="font-display font-800 text-xl text-on-surface mb-1">
          購入完了！
        </h2>
        <p className="text-xs text-on-surface-variant mb-5">
          ご登録のメールアドレスに確認メールをお送りしました
        </p>
        <div className="bg-surface-container-low rounded-xl p-4 text-left space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">チケット</span>
            <span className="font-700 text-on-surface">{selectedTicket?.label}</span>
          </div>
          {(selectedTicket?.hasQuantity) && (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">大人</span>
              <span className="font-700 text-on-surface">{quantity}名</span>
            </div>
          )}
          {(selectedTicket?.hasQuantity) && childQuantity > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">小学生以下</span>
              <span className="font-700 text-secondary">{childQuantity}名（無料）</span>
            </div>
          )}
          <div className="flex justify-between items-baseline border-t border-outline-variant/20 pt-2">
            <span className="text-xs text-on-surface-variant">合計</span>
            <span className="font-display font-800 text-xl text-on-surface">
              ¥{total.toLocaleString()}
            </span>
          </div>
        </div>
        {orderId && (
          <p className="text-[10px] text-on-surface-variant font-mono">
            注文番号: {orderId}
          </p>
        )}
      </div>
    );
  }

  const stepIndex: Record<Exclude<Step, 'success'>, number> = {
    select: 0,
    info: 1,
    payment: 2,
  };
  const currentStepIdx = stepIndex[step as Exclude<Step, 'success'>] ?? 0;

  return (
    <div className="space-y-4">
      {/* ── プログレス ── */}
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= currentStepIdx ? 'bg-on-surface' : 'bg-outline-variant/30'
            }`}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════ STEP 1 */}
      {step === 'select' && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between px-0.5">
            <p className="label-upper text-on-surface-variant">チケット選択</p>
            {isAdvanceSale && (
              <p className="text-[10px] text-on-surface-variant">前売り: 4/20（月）23:59 まで</p>
            )}
          </div>

          {tickets.map(ticket => {
            const isCar = ticket.type === 'advance_car';
            const soldOut = isCar && remainingCar === 0;
            const stockColor =
              remainingCar === null ? 'text-on-surface-variant' :
              remainingCar <= 10 ? 'text-error font-800' :
              remainingCar <= 20 ? 'text-amber-600 font-700' :
              'text-secondary font-700';

            return (
              <button
                key={ticket.type}
                onClick={() => {
                  if (soldOut) return;
                  setTicketType(ticket.type);
                  if (!ticket.hasQuantity) { setQuantity(1); setChildQuantity(0); }
                }}
                disabled={soldOut}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between gap-3 text-left transition-all duration-150 ${
                  soldOut
                    ? 'opacity-50 cursor-not-allowed border-outline-variant/20 bg-surface-container-low'
                    : ticketType === ticket.type
                    ? 'border-on-surface bg-surface-container active:scale-[0.98]'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant active:scale-[0.98]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[9px] tracking-widest font-700 uppercase px-1.5 py-px rounded ${ticket.badgeClass}`}>
                      {ticket.badge}
                    </span>
                    {soldOut && (
                      <span className="text-[9px] font-700 px-1.5 py-px rounded bg-error/10 text-error">完売</span>
                    )}
                    {!soldOut && ticketType === ticket.type && (
                      <span className="i-ph-check-circle-fill text-sm text-secondary" />
                    )}
                  </div>
                  <p className="font-display font-700 text-sm text-on-surface leading-tight">
                    {ticket.label}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    {ticket.sublabel}
                  </p>
                  {isCar && remainingCar !== null && (
                    <p className={`text-[10px] mt-1 ${stockColor}`}>
                      残り {remainingCar} 枚
                    </p>
                  )}
                  {isCar && remainingCar === null && (
                    <p className="text-[10px] text-on-surface-variant/40 mt-1">在庫確認中...</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display font-800 text-2xl tracking-tight text-on-surface">
                    ¥{ticket.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-on-surface-variant">/{ticket.unit}</span>
                </div>
              </button>
            );
          })}

          {/* 枚数セレクター */}
          {ticketType && selectedTicket?.hasQuantity && (
            <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
              {/* 大人 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-600 text-on-surface">大人</span>
                  <span className="text-[10px] text-on-surface-variant ml-1.5">¥{selectedTicket.price.toLocaleString()}/人</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform"
                  >
                    <span className="i-ph-minus-bold text-sm text-on-surface" />
                  </button>
                  <span className="font-display font-800 text-2xl w-6 text-center text-on-surface tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="w-9 h-9 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform"
                  >
                    <span className="i-ph-plus-bold text-sm text-on-surface" />
                  </button>
                </div>
              </div>
              {/* 小学生以下 */}
              <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
                <div>
                  <span className="text-sm font-600 text-on-surface">小学生以下</span>
                  <span className="text-[10px] text-secondary font-700 ml-1.5">無料</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setChildQuantity(q => Math.max(0, q - 1))}
                    className="w-9 h-9 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform"
                  >
                    <span className="i-ph-minus-bold text-sm text-on-surface" />
                  </button>
                  <span className="font-display font-800 text-2xl w-6 text-center text-on-surface tabular-nums">{childQuantity}</span>
                  <button
                    onClick={() => setChildQuantity(q => Math.min(10, q + 1))}
                    className="w-9 h-9 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform"
                  >
                    <span className="i-ph-plus-bold text-sm text-on-surface" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {ticketType && (
            <div>
              <div className="flex items-baseline justify-between mb-3 px-0.5">
                <span className="text-xs text-on-surface-variant">合計金額</span>
                <span className="font-display font-800 text-2xl text-on-surface">
                  ¥{total.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setStep('info')}
                className="btn-primary w-full h-12 text-sm flex-center gap-1.5"
              >
                次へ
                <span className="i-ph-arrow-right-bold text-base" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════ STEP 2 */}
      {step === 'info' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setStep('select'); setError(''); }}
              className="w-8 h-8 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform"
            >
              <span className="i-ph-arrow-left-bold text-sm text-on-surface" />
            </button>
            <p className="label-upper text-on-surface-variant">お客様情報</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1.5 tracking-widest uppercase font-600">
                お名前
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="田中 太郎"
                autoComplete="name"
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-on-surface/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1.5 tracking-widest uppercase font-600">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-on-surface/50 transition-colors"
              />
            </div>
          </div>

          {/* 注文サマリー */}
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">
                {selectedTicket?.label}{selectedTicket?.hasQuantity ? '（大人）' : ''}
              </span>
              <span className="font-700 text-on-surface">
                {selectedTicket?.hasQuantity ? `× ${quantity}` : '× 1'}
              </span>
            </div>
            {selectedTicket?.hasQuantity && childQuantity > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">小学生以下</span>
                <span className="font-700 text-secondary">× {childQuantity}（無料）</span>
              </div>
            )}
            <div className="flex justify-between items-baseline border-t border-outline-variant/20 mt-1 pt-2">
              <span className="text-xs text-on-surface-variant">合計</span>
              <span className="font-display font-800 text-xl text-on-surface">
                ¥{total.toLocaleString()}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-error text-center">{error}</p>
          )}

          <button
            onClick={() => {
              if (!name.trim()) {
                setError('お名前を入力してください');
                return;
              }
              if (!email.trim() || !email.includes('@')) {
                setError('正しいメールアドレスを入力してください');
                return;
              }
              setError('');
              setStep('payment');
            }}
            className="btn-primary w-full h-12 text-sm flex-center gap-1.5"
          >
            <span className="i-ph-credit-card-bold text-base" />
            お支払いへ
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════ STEP 3 */}
      {step === 'payment' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setStep('info'); setError(''); }}
              className="w-8 h-8 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform"
            >
              <span className="i-ph-arrow-left-bold text-sm text-on-surface" />
            </button>
            <p className="label-upper text-on-surface-variant">お支払い</p>
          </div>

          {/* コンパクトサマリー */}
          <div className="bg-surface-container-lowest rounded-xl p-3 flex items-center justify-between border border-outline-variant/20">
            <div>
              <p className="text-[10px] text-on-surface-variant">
                {selectedTicket?.label}
                {selectedTicket?.hasQuantity && ` 大人×${quantity}`}
                {selectedTicket?.hasQuantity && childQuantity > 0 && ` / 小学生以下×${childQuantity}`}
              </p>
              <p className="font-display font-800 text-xl text-on-surface">
                ¥{total.toLocaleString()}
              </p>
            </div>
            <span className="i-ph-lock-simple-duotone text-2xl text-on-surface-variant/30" />
          </div>

          {/* Square カードフォーム */}
          <div>
            <label className="text-[10px] text-on-surface-variant block mb-2 tracking-widest uppercase font-600">
              クレジットカード
            </label>
            <div className="relative min-h-[90px]">
              {sqLoading && (
                <div className="absolute inset-0 flex-center rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <span className="i-ph-circle-notch-bold text-xl text-on-surface-variant animate-spin" />
                </div>
              )}
              <div
                id="square-card"
                className={`rounded-xl border border-outline-variant/40 overflow-hidden transition-opacity duration-300 ${sqLoading ? 'opacity-0' : 'opacity-100'}`}
              />
            </div>
          </div>

          {error && (
            <div className="bg-error/8 border border-error/25 rounded-xl p-3 flex gap-2 items-start">
              <span className="i-ph-warning-circle-duotone text-base text-error shrink-0 mt-0.5" />
              <p className="text-xs text-error leading-relaxed">{error}</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading || sqLoading}
            className="btn-primary w-full h-12 text-sm flex-center gap-1.5 disabled:opacity-40"
          >
            {loading ? (
              <span className="i-ph-circle-notch-bold text-base animate-spin" />
            ) : (
              <>
                <span className="i-ph-lock-key-bold text-base" />
                ¥{total.toLocaleString()} を支払う
              </>
            )}
          </button>

          <div className="flex-center gap-1.5 text-[10px] text-on-surface-variant">
            <span className="i-ph-shield-check-duotone text-sm" />
            Square による安全な SSL 決済
          </div>
        </div>
      )}
    </div>
  );
}
