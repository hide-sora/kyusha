import { defineConfig, presetWind3, presetIcons, presetWebFonts } from 'unocss';
import { icons as phIcons } from '@iconify-json/ph';

export default defineConfig({
  safelist: [
    'i-ph-map-trifold-duotone', 'i-ph-clock-countdown-duotone',
    'i-ph-gavel-duotone', 'i-ph-trophy-duotone',
    'i-ph-car-profile-duotone', 'i-ph-steering-wheel-duotone',
    'i-ph-flag-checkered-duotone', 'i-ph-megaphone-duotone',
    'i-ph-caret-right-bold', 'i-ph-arrow-left-bold', 'i-ph-arrow-right-bold',
    'i-ph-fire-bold', 'i-ph-check-bold',
    'i-ph-flag-checkered-fill', 'i-ph-clock-duotone', 'i-ph-calendar-duotone',
    'i-ph-map-pin-duotone', 'i-ph-ticket-duotone',
    'i-ph-house-duotone', 'i-ph-spinner-bold',
    'i-ph-info-duotone', 'i-ph-caret-down-bold',
    'i-ph-star-duotone', 'i-ph-users-three-duotone',
  ],
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        ph: () => phIcons,
      },
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: [
          { name: 'Inter', weights: [400, 500, 600, 700] },
        ],
        display: [
          { name: 'Plus Jakarta Sans', weights: [500, 600, 700, 800] },
        ],
      },
    }),
  ],
  theme: {
    colors: {
      // Heritage Curator Design System — Stitch
      'background': '#f9f9fb',
      'on-background': '#2e3336',
      'surface': '#f9f9fb',
      'surface-bright': '#f9f9fb',
      'surface-dim': '#d7dadf',
      'surface-container': '#eceef1',
      'surface-container-low': '#f2f4f6',
      'surface-container-lowest': '#ffffff',
      'surface-container-high': '#e6e8ec',
      'surface-container-highest': '#dfe3e7',
      'surface-variant': '#dfe3e7',
      'surface-tint': '#605f5e',
      'primary': '#605f5e',
      'primary-dim': '#545353',
      'primary-container': '#e5e2e1',
      'primary-fixed': '#e5e2e1',
      'primary-fixed-dim': '#d7d4d3',
      'on-primary': '#fbf8f7',
      'on-primary-container': '#525151',
      'on-primary-fixed': '#403f3f',
      'secondary': '#526076',
      'secondary-dim': '#46546a',
      'secondary-container': '#d5e3fe',
      'secondary-fixed': '#d5e3fe',
      'secondary-fixed-dim': '#c7d5f0',
      'on-secondary': '#f8f8ff',
      'on-secondary-container': '#455268',
      'on-secondary-fixed': '#324055',
      'tertiary': '#6d5c4a',
      'tertiary-dim': '#60503f',
      'tertiary-container': '#fee7d0',
      'tertiary-fixed': '#fee7d0',
      'tertiary-fixed-dim': '#f0d9c3',
      'on-tertiary': '#fff7f3',
      'on-tertiary-container': '#645443',
      'on-tertiary-fixed': '#514232',
      'outline': '#777b7f',
      'outline-variant': '#aeb2b6',
      'error': '#a83836',
      'error-container': '#fa746f',
      'error-dim': '#67040d',
      'on-error': '#fff7f6',
      'on-error-container': '#6e0a12',
      'inverse-surface': '#0c0e10',
      'inverse-on-surface': '#9c9d9f',
      'inverse-primary': '#ffffff',
      // Compatibility aliases
      'foreground': '#2e3336',
      'on-surface': '#2e3336',
      'on-surface-variant': '#5b6063',
      'muted': '#f2f4f6',
      'muted-foreground': '#5b6063',
    },
    borderRadius: {
      DEFAULT: '0.25rem',
      lg: '0.5rem',
      xl: '1.5rem',
      card: '1rem',
      full: '9999px',
    },
    animation: {
      keyframes: {
        fadeInUp: '{ from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }',
        pulse: '{ 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }',
        countUp: '{ from { transform: translateY(100%) } to { transform: translateY(0) } }',
        flipDown: '{ from { transform: translateY(-100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }',
        flipOut: '{ from { transform: translateY(0); opacity: 1 } to { transform: translateY(100%); opacity: 0 } }',
        scaleIn: '{ from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }',
        popIn: '{ 0% { transform: scale(0); opacity: 0 } 60% { transform: scale(1.15) } 100% { transform: scale(1); opacity: 1 } }',
        shimmer: '{ from { background-position: -200% 0 } to { background-position: 200% 0 } }',
        barGrow: '{ from { transform: scaleX(0) } to { transform: scaleX(1) } }',
        checkPop: '{ 0% { transform: scale(0) rotate(-45deg) } 60% { transform: scale(1.2) rotate(0deg) } 100% { transform: scale(1) rotate(0deg) } }',
        slideInRight: '{ from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }',
        wiggle: '{ 0%, 100% { transform: rotate(0deg) } 25% { transform: rotate(-3deg) } 75% { transform: rotate(3deg) } }',
      },
      durations: {
        fadeInUp: '0.6s',
        pulse: '2s',
        countUp: '0.3s',
        flipDown: '0.35s',
        flipOut: '0.2s',
        scaleIn: '0.4s',
        popIn: '0.4s',
        shimmer: '2s',
        barGrow: '0.6s',
        checkPop: '0.4s',
        slideInRight: '0.4s',
        wiggle: '0.5s',
      },
      timingFns: {
        fadeInUp: 'cubic-bezier(0.16, 1, 0.3, 1)',
        countUp: 'cubic-bezier(0.16, 1, 0.3, 1)',
        flipDown: 'cubic-bezier(0.16, 1, 0.3, 1)',
        flipOut: 'ease-in',
        scaleIn: 'cubic-bezier(0.16, 1, 0.3, 1)',
        popIn: 'cubic-bezier(0.16, 1, 0.3, 1)',
        barGrow: 'cubic-bezier(0.16, 1, 0.3, 1)',
        checkPop: 'cubic-bezier(0.16, 1, 0.3, 1)',
        slideInRight: 'cubic-bezier(0.16, 1, 0.3, 1)',
        wiggle: 'ease-in-out',
      },
      counts: {
        shimmer: 'infinite',
      },
    },
  },
  shortcuts: {
    'layout-base': 'bg-background text-on-background font-sans min-h-screen antialiased',
    'card-base': 'bg-surface-container-lowest rounded-xl p-5 relative',
    'card-elevated': 'bg-surface-container-lowest rounded-xl p-5 relative shadow-[0_20px_40px_rgba(46,51,54,0.06)]',
    'card-tonal': 'bg-surface-container-low rounded-xl p-5 relative',
    'btn-primary': 'bg-on-surface text-surface font-display font-700 px-6 py-3 rounded-xl transition-all duration-200 active:scale-[0.92] cursor-pointer hover:opacity-90 hover:shadow-[0_8px_24px_rgba(46,51,54,0.15)] relative overflow-hidden',
    'btn-secondary': 'bg-surface-container-highest text-on-surface font-display font-700 px-6 py-3 rounded-xl transition-all duration-200 active:scale-[0.92] cursor-pointer hover:bg-surface-container-high hover:shadow-[0_4px_16px_rgba(46,51,54,0.08)] relative overflow-hidden',
    'flex-center': 'flex justify-center items-center',
    'section-title': 'font-display font-700 text-2xl tracking-tight',
    'label-upper': 'text-[10px] tracking-widest font-700 uppercase',
  },
  preflights: [
    {
      getCSS: () => `
        html {
          scroll-behavior: smooth;
          -webkit-tap-highlight-color: transparent;
        }
        body {
          overscroll-behavior-y: none;
        }
        a {
          text-decoration: none;
          color: inherit;
        }
        /* Glassmorphism utility */
        .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Scroll reveal */
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Stagger children */
        .reveal-stagger > .reveal:nth-child(1) { transition-delay: 0s; }
        .reveal-stagger > .reveal:nth-child(2) { transition-delay: 0.06s; }
        .reveal-stagger > .reveal:nth-child(3) { transition-delay: 0.12s; }
        .reveal-stagger > .reveal:nth-child(4) { transition-delay: 0.18s; }
        .reveal-stagger > .reveal:nth-child(5) { transition-delay: 0.24s; }
        .reveal-stagger > .reveal:nth-child(6) { transition-delay: 0.30s; }
        .reveal-stagger > .reveal:nth-child(7) { transition-delay: 0.36s; }
        .reveal-stagger > .reveal:nth-child(8) { transition-delay: 0.42s; }
        .reveal-stagger > .reveal:nth-child(9) { transition-delay: 0.48s; }
        .reveal-stagger > .reveal:nth-child(10) { transition-delay: 0.54s; }

        /* Card press interaction */
        .card-press {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.2s ease;
        }
        .card-press:active {
          transform: scale(0.97);
        }

        /* Countdown digit flip */
        .digit-flip {
          display: inline-block;
          overflow: hidden;
          position: relative;
        }
        .digit-flip-enter {
          animation: digitFlipIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes digitFlipIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Tap ripple on buttons */
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        .ripple-effect::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), rgba(255,255,255,0.3) 0%, transparent 60%);
          transform: scale(0);
          opacity: 0;
          transition: none;
        }
        .ripple-effect:active::after {
          transform: scale(2.5);
          opacity: 1;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        }

        /* Vote success check */
        .vote-success {
          animation: voteCheck 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes voteCheck {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Ranking bar grow */
        .bar-grow {
          transform-origin: left;
          animation: barGrowAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes barGrowAnim {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        /* Nav active dot */
        .nav-dot {
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: currentColor;
          animation: dotPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes dotPop {
          from { transform: translateX(-50%) scale(0); }
          to { transform: translateX(-50%) scale(1); }
        }
      `,
    },
  ],
});
