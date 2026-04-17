import { showcaseItems } from '../../data/auctionShowcase';

function CardImage({ images }: { images: string[] }) {
  return (
    <div className="absolute inset-0">
      <img
        src={images[0]}
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function AuctionShowcase() {
  return (
    <div className="space-y-4 px-5 max-w-lg mx-auto">
      {showcaseItems.filter((item) => !item.hidden).map((item) => (
        <a
          key={item.lot}
          href={`/auction/${String(item.lot).padStart(2, '0')}`}
          className="block relative rounded-2xl overflow-hidden active:scale-[0.98] transition-transform duration-150 cursor-pointer"
          style={{ background: item.gradient, aspectRatio: '3 / 4' }}
        >
          {/* Photo carousel or decorative bg */}
          {item.images && item.images.length > 0 ? (
            <CardImage images={item.images} />
          ) : (
            <>
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px)`,
              }} />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]">
                <span className={`${item.icon} block`} style={{ fontSize: '14rem' }} />
              </div>
            </>
          )}

          {/* LOT badge - top left */}
          <div className="absolute top-5 left-5 z-10">
            <span className="bg-amber-500 text-black text-[10px] font-800 tracking-[0.2em] uppercase px-3 py-1 rounded-lg font-display">
              LOT {String(item.lot).padStart(2, '0')}
            </span>
          </div>

          {/* 詳細アイコン - top right */}
          <div className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex-center">
            <span className="i-ph-arrow-up-right-bold text-sm text-white" />
          </div>

          {/* Content - bottom */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 pt-24"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}
          >
            {/* YouTuber tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="i-ph-youtube-logo-duotone text-red-400 text-sm" />
              <span className="text-white/70 text-xs font-600">{item.youtuber}</span>
            </div>

            {/* Title */}
            <h3 className="font-display font-800 text-2xl text-white leading-tight mb-1">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="font-display font-600 text-white/30 text-xs tracking-widest uppercase mb-2">
                {item.subtitle}
              </p>
            )}

            {/* Description */}
            <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
              {item.description}
            </p>

            {/* Price + View detail */}
            <div className="flex items-end justify-between gap-3">
              {item.startPrice > 0 ? (
                <div>
                  <span className="text-amber-500/70 text-[10px] font-700 tracking-[0.2em] uppercase block mb-1">
                    START PRICE
                  </span>
                  <span className="font-display font-800 text-xl text-amber-400 tabular-nums">
                    &yen;{item.startPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2">
                  <span className="i-ph-clock-countdown-duotone text-amber-400 text-base" />
                  <span className="text-white/80 text-xs font-display font-700">価格未定</span>
                </div>
              )}
              <span className="inline-flex items-center gap-1 text-white/70 text-xs font-display font-700 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm shrink-0">
                詳細を見る
                <span className="i-ph-arrow-right-bold text-xs" />
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
