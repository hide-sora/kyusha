import { featuredCars } from '../../data/featuredCars';

export default function FeaturedCars() {
  return (
    <div className="space-y-4 px-5 max-w-lg mx-auto">
      {featuredCars.map((car) => (
        <div
          key={car.zone}
          className="relative rounded-2xl overflow-hidden"
          style={{ background: car.gradient, aspectRatio: '3 / 4' }}
        >
          {/* Decorative bg pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px)`,
          }} />

          {/* Large car icon as background */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]">
            <span className="i-ph-car-profile-duotone block" style={{ fontSize: '14rem' }} />
          </div>

          {/* Zone badge - top left */}
          <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
            <span
              className="text-white text-[10px] font-800 tracking-[0.2em] uppercase px-3 py-1 rounded-lg font-display"
              style={{ backgroundColor: car.zoneColor }}
            >
              {car.zone} ZONE
            </span>
          </div>

          {/* Content - bottom */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 pt-24"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}
          >
            {/* Owner / category */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: car.zoneColor }}
              />
              <span className="text-white/60 text-xs font-600">{car.owner}</span>
            </div>

            {/* Car name */}
            <h3 className="font-display font-800 text-2xl text-white leading-tight mb-1">
              {car.carName}
            </h3>

            {/* Description */}
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              {car.description}
            </p>

            {/* Coming soon badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2">
              <span className="i-ph-clock-countdown-duotone text-base" style={{ color: car.zoneColor }} />
              <span className="text-white/80 text-xs font-display font-700">近日公開</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
