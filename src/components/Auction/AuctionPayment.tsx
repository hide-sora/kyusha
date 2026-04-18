import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    Square?: any;
  }
}

type PayMethod = 'card' | 'paypay' | 'bank';

interface Props {
  itemId: string;
  itemTitle: string;
  amount: number;
}

export default function AuctionPayment({ itemId, itemTitle, amount }: Props) {
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'method' | 'info' | 'pay' | 'done'>('method');
  const [loading, setLoading] = useState(false);
  const [sqLoading, setSqLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const cardRef = useRef<any>(null);
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string>('');

  // Square SDK init
  useEffect(() => {
    if (step !== 'pay' || method !== 'card') return;
    let cancelled = false;

    async function initSquare() {
      setSqLoading(true);
      const appId = import.meta.env.PUBLIC_SQUARE_APP_ID;
      const locationId = import.meta.env.PUBLIC_SQUARE_LOCATION_ID;
      if (!appId || !locationId) {
        setError('決済設定が完了していません');
        setSqLoading(false);
        return;
      }
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
          '.input-container': { borderColor: '#dfe3e7', borderRadius: '12px' },
          '.input-container.is-focus': { borderColor: '#2e3336' },
          input: { color: '#2e3336' },
          'input::placeholder': { color: '#aeb2b6' },
        },
      });
      await card.attach('#sq-auction-card');
      if (!cancelled) { cardRef.current = card; setSqLoading(false); }
    }

    initSquare().catch(err => {
      if (!cancelled) { setError(err.message || 'カードフォームの読み込みに失敗しました'); setSqLoading(false); }
    });
    return () => { cancelled = true; if (cardRef.current) { cardRef.current.destroy(); cardRef.current = null; } };
  }, [step, method]);

  const handleCardPayment = useCallback(async () => {
    if (!cardRef.current || loading || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError('');

    // リトライ時も同じ idempotencyKey を再利用（Square 側で二重決済を防止）
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    }

    try {
      const tokenResult = await cardRef.current.tokenize();
      if (tokenResult.status !== 'OK') {
        setError(tokenResult.errors?.[0]?.message || 'カード情報の確認に失敗しました');
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      const res = await fetch('/api/auction-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          itemId,
          amount,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'お支払いに失敗しました');
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      setPaymentId(data.paymentId || '');
      setStep('done');
      idempotencyKeyRef.current = '';
    } catch {
      setError('通信エラーが発生しました');
      setLoading(false);
      submittingRef.current = false;
    }
  }, [loading, itemId, amount, name, email]);

  // ── 完了 ──
  if (step === 'done') {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex-center mx-auto mb-4">
          <span className="i-ph-check-circle-duotone text-4xl text-secondary" />
        </div>
        <h2 className="font-display font-800 text-xl text-on-surface mb-2">お支払い完了！</h2>
        <p className="text-sm text-on-surface-variant mb-1">{itemTitle}</p>
        <p className="font-display font-800 text-2xl text-on-surface mb-4">¥{amount.toLocaleString()}</p>
        {method === 'card' && paymentId && (
          <p className="text-[10px] text-on-surface-variant font-mono">決済ID: {paymentId}</p>
        )}
        {method === 'bank' && (
          <p className="text-xs text-on-surface-variant">お振込確認後、スタッフよりご連絡いたします</p>
        )}
        {method === 'paypay' && (
          <p className="text-xs text-on-surface-variant">送金確認後、スタッフよりご連絡いたします</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 金額表示 */}
      <div className="text-center py-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
        <p className="text-[10px] text-on-surface-variant tracking-widest uppercase font-600 mb-1">落札金額</p>
        <p className="font-display font-800 text-3xl text-on-surface">¥{amount.toLocaleString()}</p>
        <p className="text-xs text-on-surface-variant mt-1">{itemTitle}</p>
      </div>

      {/* ── STEP 1: 支払い方法選択 ── */}
      {step === 'method' && (
        <div className="space-y-3">
          <p className="text-[10px] tracking-widest uppercase font-600 text-on-surface-variant">お支払い方法を選択</p>

          <button
            onClick={() => { setMethod('card'); setStep('info'); }}
            className={`w-full text-left rounded-xl p-4 border-2 transition-all active:scale-[0.98] ${
              method === 'card' ? 'border-on-surface bg-surface-container-lowest' : 'border-outline-variant/30 bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex-center shrink-0">
                <span className="i-ph-credit-card-duotone text-xl text-on-surface" />
              </div>
              <div>
                <p className="font-display font-700 text-sm text-on-surface">クレジットカード</p>
                <p className="text-[10px] text-on-surface-variant">VISA / Mastercard / JCB / AMEX</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setMethod('paypay'); setStep('info'); }}
            className={`w-full text-left rounded-xl p-4 border-2 transition-all active:scale-[0.98] ${
              method === 'paypay' ? 'border-on-surface bg-surface-container-lowest' : 'border-outline-variant/30 bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff0033]/10 flex-center shrink-0">
                <span className="font-800 text-[#ff0033] text-xs">Pay</span>
              </div>
              <div>
                <p className="font-display font-700 text-sm text-on-surface">PayPay</p>
                <p className="text-[10px] text-on-surface-variant">PayPay残高から送金</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setMethod('bank'); setStep('info'); }}
            className={`w-full text-left rounded-xl p-4 border-2 transition-all active:scale-[0.98] ${
              method === 'bank' ? 'border-on-surface bg-surface-container-lowest' : 'border-outline-variant/30 bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex-center shrink-0">
                <span className="i-ph-bank-duotone text-xl text-on-surface" />
              </div>
              <div>
                <p className="font-display font-700 text-sm text-on-surface">銀行振込</p>
                <p className="text-[10px] text-on-surface-variant">振込先をご案内します</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ── STEP 2: お客様情報 ── */}
      {step === 'info' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => { setStep('method'); setError(''); }}
              className="w-8 h-8 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform">
              <span className="i-ph-arrow-left-bold text-sm text-on-surface" />
            </button>
            <p className="text-[10px] tracking-widest uppercase font-600 text-on-surface-variant">お客様情報</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1.5 tracking-widest uppercase font-600">お名前</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="田中 太郎" autoComplete="name"
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-on-surface/50 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1.5 tracking-widest uppercase font-600">メールアドレス</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" autoComplete="email"
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-on-surface/50 transition-colors" />
            </div>
          </div>
          {error && <p className="text-xs text-error text-center">{error}</p>}
          <button onClick={() => {
            if (!name.trim()) { setError('お名前を入力してください'); return; }
            if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('正しいメールアドレスを入力してください'); return; }
            setError('');
            setStep('pay');
          }} className="btn-primary w-full h-12 text-sm flex-center gap-1.5">
            次へ <span className="i-ph-arrow-right-bold text-base" />
          </button>
        </div>
      )}

      {/* ── STEP 3: 支払い ── */}
      {step === 'pay' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => { setStep('info'); setError(''); }}
              className="w-8 h-8 rounded-full bg-surface-container-high flex-center active:scale-90 transition-transform">
              <span className="i-ph-arrow-left-bold text-sm text-on-surface" />
            </button>
            <p className="text-[10px] tracking-widest uppercase font-600 text-on-surface-variant">お支払い</p>
          </div>

          {/* クレジットカード */}
          {method === 'card' && (
            <>
              <div>
                <label className="text-[10px] text-on-surface-variant block mb-2 tracking-widest uppercase font-600">クレジットカード</label>
                <div className="relative min-h-[90px]">
                  {sqLoading && (
                    <div className="absolute inset-0 flex-center rounded-xl bg-surface-container-low border border-outline-variant/30">
                      <span className="i-ph-circle-notch-bold text-xl text-on-surface-variant animate-spin" />
                    </div>
                  )}
                  <div id="sq-auction-card" className={`rounded-xl border border-outline-variant/40 overflow-hidden transition-opacity duration-300 ${sqLoading ? 'opacity-0' : 'opacity-100'}`} />
                </div>
              </div>
              {error && (
                <div className="bg-error/8 border border-error/25 rounded-xl p-3 flex gap-2 items-start">
                  <span className="i-ph-warning-circle-duotone text-base text-error shrink-0 mt-0.5" />
                  <p className="text-xs text-error leading-relaxed">{error}</p>
                </div>
              )}
              <button onClick={handleCardPayment} disabled={loading || sqLoading}
                className="btn-primary w-full h-12 text-sm flex-center gap-1.5 disabled:opacity-40">
                {loading ? <span className="i-ph-circle-notch-bold text-base animate-spin" /> : (
                  <><span className="i-ph-lock-key-bold text-base" />¥{amount.toLocaleString()} を支払う</>
                )}
              </button>
              <div className="flex-center gap-1.5 text-[10px] text-on-surface-variant">
                <span className="i-ph-shield-check-duotone text-sm" />
                Square による安全な SSL 決済
              </div>
            </>
          )}

          {/* PayPay */}
          {method === 'paypay' && (
            <div className="space-y-4">
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#ff0033]/10 flex-center mx-auto">
                  <span className="font-800 text-[#ff0033] text-lg">Pay</span>
                </div>
                <p className="text-sm text-on-surface font-600">PayPayで送金してください</p>
                <div className="space-y-2 text-left bg-surface-container-low rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">送金先ID</span>
                    <span className="font-700 text-on-surface font-mono">mitodouraku</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">金額</span>
                    <span className="font-display font-800 text-on-surface">¥{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">メモ欄に記入</span>
                    <span className="font-600 text-on-surface text-xs">{name}／{itemTitle}</span>
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant">送金時のメモに「お名前／商品名」をご記入ください</p>
              </div>
              <button onClick={() => setStep('done')}
                className="btn-primary w-full h-12 text-sm flex-center gap-1.5">
                <span className="i-ph-check-bold text-base" />送金しました
              </button>
            </div>
          )}

          {/* 銀行振込 */}
          {method === 'bank' && (
            <div className="space-y-4">
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="i-ph-bank-duotone text-lg text-on-surface" />
                  <p className="text-sm font-700 text-on-surface">振込先口座</p>
                </div>
                <div className="space-y-2 bg-surface-container-low rounded-xl p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">銀行名</span>
                    <span className="font-700 text-on-surface">常陽銀行</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">支店名</span>
                    <span className="font-700 text-on-surface">水戸営業部</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">口座種別</span>
                    <span className="font-700 text-on-surface">普通</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">口座番号</span>
                    <span className="font-700 text-on-surface font-mono">お問い合わせください</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">名義</span>
                    <span className="font-700 text-on-surface">アンゾウショウジ（ド</span>
                  </div>
                  <div className="border-t border-outline-variant/20 pt-2 flex justify-between">
                    <span className="text-on-surface-variant">振込金額</span>
                    <span className="font-display font-800 text-on-surface">¥{amount.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant">振込手数料はお客様ご負担となります</p>
              </div>
              <button onClick={() => setStep('done')}
                className="btn-primary w-full h-12 text-sm flex-center gap-1.5">
                <span className="i-ph-check-bold text-base" />振込手続きをしました
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
