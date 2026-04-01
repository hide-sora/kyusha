import { defineConfig, presetWind3, presetIcons, presetWebFonts } from 'unocss';
import { icons as phIcons } from '@iconify-json/ph';

export default defineConfig({
  safelist: [
    // ナビアイコン
    'i-ph-map-trifold-duotone', 'i-ph-clock-countdown-duotone',
    'i-ph-gavel-duotone', 'i-ph-trophy-duotone',
    'i-ph-car-profile-duotone', 'i-ph-steering-wheel-duotone',
    'i-ph-flag-checkered-duotone', 'i-ph-megaphone-duotone',
    'i-ph-caret-right-bold', 'i-ph-arrow-left-bold',
    'i-ph-fire-bold', 'i-ph-check-bold',
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
        // レトロ感のある日本語フォント + 力強い英字
        sans: [
          { name: 'Zen Maru Gothic', weights: [400, 500, 700, 900] },
        ],
        display: [
          { name: 'Oswald', weights: [400, 500, 600, 700] },
        ],
      },
    }),
  ],
  theme: {
    colors: {
      // ダークベース + ゴールド/クロームのレトロカーテーマ
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      card: 'hsl(var(--card))',
      'card-foreground': 'hsl(var(--card-foreground))',
      primary: 'hsl(var(--primary))',
      'primary-foreground': 'hsl(var(--primary-foreground))',
      secondary: 'hsl(var(--secondary))',
      'secondary-foreground': 'hsl(var(--secondary-foreground))',
      muted: 'hsl(var(--muted))',
      'muted-foreground': 'hsl(var(--muted-foreground))',
      accent: 'hsl(var(--accent))',
      'accent-foreground': 'hsl(var(--accent-foreground))',
      destructive: 'hsl(var(--destructive))',
      border: 'hsl(var(--border))',
      ring: 'hsl(var(--ring))',
      // カスタム
      gold: 'hsl(var(--gold))',
      chrome: 'hsl(var(--chrome))',
    },
    borderRadius: {
      card: '1rem',
      button: '0.75rem',
      pill: '9999px',
    },
    animation: {
      keyframes: {
        fadeInUp: '{ from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }',
        pulse: '{ 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }',
        countUp: '{ from { transform: translateY(100%) } to { transform: translateY(0) } }',
      },
      durations: {
        fadeInUp: '0.6s',
        pulse: '2s',
        countUp: '0.3s',
      },
      timingFns: {
        fadeInUp: 'cubic-bezier(0.16, 1, 0.3, 1)',
        countUp: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  shortcuts: {
    'layout-base': 'bg-background text-foreground font-sans min-h-screen antialiased',
    'card-base': 'bg-card border border-border rounded-card p-5 relative',
    'btn-primary': 'bg-primary text-primary-foreground font-700 px-6 py-3 rounded-button transition-all active:scale-95 hover:brightness-110 cursor-pointer',
    'btn-outline': 'border-2 border-primary text-primary font-700 px-6 py-3 rounded-button transition-all active:scale-95 hover:bg-primary hover:text-primary-foreground cursor-pointer',
    'flex-center': 'flex justify-center items-center',
    'text-gold-gradient': 'bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500',
    'section-title': 'font-display font-700 text-2xl tracking-tight uppercase',
  },
  preflights: [
    {
      getCSS: () => `
        :root {
          /* ダークテーマ - レトロカー */
          --background: 220 20% 7%;
          --foreground: 40 10% 92%;
          --card: 220 18% 11%;
          --card-foreground: 40 10% 92%;
          --primary: 42 85% 55%;
          --primary-foreground: 220 20% 7%;
          --secondary: 220 15% 18%;
          --secondary-foreground: 40 10% 85%;
          --muted: 220 15% 15%;
          --muted-foreground: 220 10% 55%;
          --accent: 15 80% 55%;
          --accent-foreground: 40 10% 95%;
          --destructive: 0 72% 51%;
          --border: 220 15% 18%;
          --ring: 42 85% 55%;
          --gold: 42 85% 55%;
          --chrome: 220 10% 72%;
        }
        html {
          scroll-behavior: smooth;
          -webkit-tap-highlight-color: transparent;
        }
        body {
          overscroll-behavior-y: none;
        }
        /* ゴールドグラデーション */
        .gold-shine {
          background: linear-gradient(135deg, hsl(42, 85%, 45%), hsl(38, 90%, 58%), hsl(45, 80%, 65%), hsl(38, 90%, 58%));
          background-size: 200% 200%;
          animation: goldShimmer 3s ease-in-out infinite;
        }
        @keyframes goldShimmer {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        /* クロームテキスト */
        .chrome-text {
          background: linear-gradient(180deg, hsl(220,10%,90%) 0%, hsl(220,10%,65%) 50%, hsl(220,10%,85%) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        /* レトロストライプ背景 */
        .retro-stripe {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            hsla(42, 85%, 55%, 0.03) 10px,
            hsla(42, 85%, 55%, 0.03) 20px
          );
        }
      `,
    },
  ],
});
