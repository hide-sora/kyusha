import { useState, useEffect, useRef, useCallback } from 'react';
import TicketCard from './TicketCard';
import { saveMyTicket } from '../../lib/myTicket';

declare global {
  interface Window {
    Square?: any;
  }
}

type TicketType = 'advance_general' | 'day_general';
type Step = 'select' | 'info' | 'payment' | 'success';

interface TicketConfig {
  type: TicketType;
  label: string;
  sublabel: string;
  price: number;
  unit: string;
  hasQuantity: boolean;
}

// 前売 → 当日の切替: 2026-04-26 00:00 JST
const PRESALE_CUTOFF_MS = Date.parse('2026-04-26T00:00:00+09:00');

const PRESALE_TICKET: TicketConfig = {
  type: 'advance_general',
  label: '一般入場（前売券）',
  sublabel: '4/25(土) 23:59まで・もてぎ入場料・駐車場代込み',
  price: 1500,
  unit: '人',
  hasQuantity: true,
};

const DAY_TICKET: TicketConfig = {
  type: 'day_general',
  label: '一般入場（当日券）',
  sublabel: 'もてぎ入場料・駐車場代込み',
  price: 2500,
  unit: '人',
  hasQuantity: true,
};

const TICKET: TicketConfig =
  Date.now() < PRESALE_CUTOFF_MS ? PRESALE_TICKET : DAY_TICKET;

export default function TicketForm() {
  const [step, setStep] = useState<Step>('select');
  const [successPhase, setSuccessPhase] = useState<'paid' | 'ticket'>('paid');
  const ticketType: TicketType = TICKET.type;
  const [quantity, setQuantity] = useState(1);
  const [childQuantity, setChildQuantity] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sqLoading, setSqLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [ticketCode, setTicketCode] = useState('');

  // 決済完了 → チケット表示へ自動遷移
  useEffect(() => {
    if (step === 'success' && successPhase === 'paid') {
      const t = setTimeout(() => setSuccessPhase('ticket'), 2000);
      return () => clearTimeout(t);
    }
  }, [step, successPhase]);

  const cardRef = useRef<any>(null);
  const selectedTicket = TICKET;
  const total = TICKET.price * quantity;

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
          },
          input: {
            color: '#2e3336',
          },
          'input::placeholder': {
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

  const submittingRef = useRef(false);

  const handlePayment = useCallback(async () => {
    if (!cardRef.current || loading || submittingRef.current) return;
    submittingRef.current = true;
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
        submittingRef.current = false;
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
      setTicketCode(data.ticketCode || '');
      setStep('success');

      // localStorage に保存 → 以降はFABからいつでも呼び出せる
      saveMyTicket({
        ticketLabel: selectedTicket.label,
        name,
        quantity,
        childQuantity,
        ticketCode: data.ticketCode || '',
        orderId: data.orderId || '',
        total,
        purchasedAt: Date.now(),
      });
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。');
      setLoading(false);
      submittingRef.current = false;
    }
  }, [loading, ticketType, quantity, childQuantity, name, email, total]);

  // ── 完了画面 ──────────────────────────────────
  if (step === 'success') {
    // ── フェーズ1: 決済完了スプラッシュ ──
    if (successPhase === 'paid') {
      return (
        <div className="ticket-success-screen -mx-5 -my-5 min-h-[520px] flex-center flex-col px-6 py-10 text-center">
          <div className="relative mb-6">
            {/* 波紋 */}
            <span className="absolute inset-0 rounded-full bg-secondary/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-secondary flex-center animate-popIn shadow-[0_12px_32px_rgba(82,96,118,0.35)]">
              <span className="i-ph-check-bold text-[56px] text-on-secondary" />
            </div>
          </div>
          <h2 className="font-display font-800 text-3xl tracking-tight text-on-surface">
            決済完了
          </h2>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
            ご購入ありがとうございました<br />
            確認メールをお送りしました
          </p>
          <button
            onClick={() => setSuccessPhase('ticket')}
            className="mt-8 text-[11px] text-on-surface-variant flex-center gap-1 active:scale-95 transition-transform"
          >
            チケットを表示
            <span className="i-ph-arrow-right-bold text-sm" />
          </button>
        </div>
      );
    }

    // ── フェーズ2: チケット表示 ──
    return (
      <div className="animate-scaleIn ticket-success-screen space-y-3 -mx-5 -my-5">
        {/* 入場時の案内バナー */}
        <div className="mx-3 mt-4 rounded-xl bg-on-surface text-surface px-4 py-3 flex items-start gap-2.5">
          <span className="i-ph-qr-code-duotone text-2xl shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-display font-800 text-sm leading-tight">
              この画面を入場時にご提示ください
            </p>
            <p className="text-[10px] opacity-80 mt-1 leading-snug">
              電波が繋がらない場合に備え、
              <span className="font-700">スクリーンショットで保存</span>
              をおすすめします
            </p>
          </div>
        </div>

        {/* ═══════ チケット ═══════ */}
        <div className="px-3 pb-3">
          <TicketCard
            ticketLabel={selectedTicket?.label || ''}
            name={name}
            quantity={quantity}
            childQuantity={childQuantity}
            ticketCode={ticketCode}
            orderId={orderId}
            total={total}
          />
        </div>

        {/* 下部: メール注意 */}
        <div className="mx-5 mb-5 text-center">
          <p className="text-[10px] text-on-surface-variant/80 leading-relaxed">
            メールが届かない場合は迷惑メールフォルダをご確認ください
          </p>
        </div>
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

      {/* ═══════════════════════════════════════ STEP 1: 枚数選択 */}
      {step === 'select' && (
        <div className="space-y-3">
          <p className="label-upper text-on-surface-variant px-0.5">枚数を選択</p>

          {/* チケット情報 */}
          <div className="p-4 rounded-xl border-2 border-on-surface bg-surface-container">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display font-700 text-sm text-on-surface">{TICKET.label}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{TICKET.sublabel}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-display font-800 text-2xl tracking-tight text-on-surface">
                  ¥{TICKET.price.toLocaleString()}
                </span>
                <span className="text-xs text-on-surface-variant">/{TICKET.unit}</span>
              </div>
            </div>
          </div>

          {/* 枚数セレクター */}
          <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
            {/* 大人 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-600 text-on-surface">大人</span>
                <span className="text-[10px] text-on-surface-variant ml-1.5">¥{TICKET.price.toLocaleString()}/人</span>
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
              if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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
