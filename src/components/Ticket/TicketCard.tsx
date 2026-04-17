interface TicketCardProps {
  ticketLabel: string;
  name: string;
  quantity: number;
  childQuantity: number;
  ticketCode: string;
  orderId: string;
  total: number;
  /** ノッチの背景色（親の背景色に合わせる） */
  notchColor?: string;
}

export default function TicketCard({
  ticketLabel,
  name,
  quantity,
  childQuantity,
  ticketCode,
  orderId,
  total,
  notchColor = 'bg-surface-container-lowest',
}: TicketCardProps) {
  const orderShort = orderId ? orderId.slice(-6).toUpperCase() : '------';

  return (
    <div className="relative mx-auto max-w-[340px] shadow-[0_24px_48px_rgba(0,0,0,0.25)] rounded-2xl">
      {/* ── 上段：車ヒーロー ── */}
      <div className="relative bg-black rounded-t-2xl overflow-hidden">
        <img
          src="/ticket/hero-car.jpg"
          alt=""
          className="w-full h-32 object-cover opacity-90"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 80%, #000 100%)',
          }}
        />
        <p className="absolute top-3 left-4 text-[9px] tracking-[0.35em] text-white/70">
          夢と挑戦の軌跡
        </p>
        <p className="absolute top-3 right-4 text-[9px] tracking-[0.2em] text-white/50">
          ADMIT ONE
        </p>
      </div>

      {/* ── 中段：イベント情報（黒） ── */}
      <div className="bg-black text-white px-5 pt-2 pb-4">
        <p className="font-display font-600 text-[10px] tracking-[0.3em] text-white/60">
          第3回 水戸道楽TV 主催
        </p>
        <h3 className="font-display font-800 text-[20px] tracking-tight leading-[1.15] mt-1">
          YouTuber 旧車サミット 2026
        </h3>

        <div className="mt-4 flex items-end gap-2">
          <span className="font-display font-800 text-[34px] leading-none tabular-nums">
            4<span className="opacity-60">/</span>26
          </span>
          <span className="text-xs text-white/70 pb-1">(日)</span>
          <span className="ml-auto pb-1 text-[9px] tracking-widest text-white/70 border border-white/30 px-1.5 py-0.5 rounded">
            雨天決行
          </span>
        </div>
        <div className="mt-3 space-y-1 text-[11px] text-white/80">
          <div className="flex items-center gap-1.5">
            <span className="i-ph-clock-duotone text-sm opacity-60" />
            9:00〜15:00
          </div>
          <div className="flex items-center gap-1.5">
            <span className="i-ph-map-pin-duotone text-sm opacity-60" />
            モビリティリゾートもてぎ 南コース
          </div>
        </div>
      </div>

      {/* ── 下段：緑のスタブ ── */}
      <div
        className="relative rounded-b-2xl px-4 pt-4 pb-4 text-black"
        style={{ backgroundColor: '#c6dc4a' }}
      >
        {/* ノッチ */}
        <div className={`absolute -top-2 -left-2 w-4 h-4 rounded-full ${notchColor} z-10`} />
        <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${notchColor} z-10`} />
        <div className="absolute left-3 right-3 -top-px border-t-2 border-dashed border-black/40" />

        {/* 名前・人数を大きく表示 */}
        <div className="mb-3">
          <p className="text-[9px] tracking-[0.3em] font-700 opacity-55">NAME</p>
          <p className="font-display font-800 text-2xl leading-tight mt-0.5 truncate">
            {name || '—'} <span className="text-base font-700 opacity-80">様</span>
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <div>
              <span className="text-[9px] tracking-[0.25em] font-700 opacity-55 mr-1">大人</span>
              <span className="font-display font-800 text-2xl leading-none tabular-nums">
                ×{quantity}
              </span>
            </div>
            {childQuantity > 0 && (
              <div>
                <span className="text-[9px] tracking-[0.25em] font-700 opacity-55 mr-1">小人</span>
                <span className="font-display font-800 text-2xl leading-none tabular-nums">
                  ×{childQuantity}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* QR + チケット情報 */}
        <div className="flex items-start gap-3 pt-3 border-t border-dashed border-black/30">
          {ticketCode && (
            <img
              src={`/api/qr/${ticketCode}.png`}
              alt="入場QRコード"
              className="w-[84px] h-[84px] shrink-0 rounded-md bg-white p-1"
            />
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[9px] tracking-[0.3em] font-700 opacity-55">TICKET</p>
            <p className="font-display font-800 text-[13px] leading-tight mt-0.5">
              {ticketLabel}
            </p>
            {ticketCode && (
              <p className="font-mono font-800 text-[14px] tracking-[0.15em] mt-1.5 leading-none">
                {ticketCode}
              </p>
            )}
            <p className="font-display font-800 text-base mt-1.5 leading-none">
              ¥{total.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-dashed border-black/25 flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-700 opacity-70">
            № {orderShort}
          </span>
          <span className="text-[9px] opacity-70">
            本券を当日会場にてご提示ください
          </span>
        </div>
      </div>
    </div>
  );
}
