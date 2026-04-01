/* empty css                                   */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$Nav } from '../chunks/Nav_DI6x8OHo.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const EVENT_DATE = /* @__PURE__ */ new Date("2026-04-26T09:00:00+09:00");
function calcTimeLeft() {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1e3 * 60 * 60 * 24)),
    hours: Math.floor(diff / (1e3 * 60 * 60) % 24),
    minutes: Math.floor(diff / (1e3 * 60) % 60),
    seconds: Math.floor(diff / 1e3 % 60)
  };
}
function CountUnit({ value, label }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden w-14 h-14 sm:w-16 sm:h-16 bg-secondary rounded-lg flex-center border border-border", children: /* @__PURE__ */ jsx("span", { className: "font-display font-700 text-2xl sm:text-3xl text-gold-gradient tabular-nums", children: String(value).padStart(2, "0") }) }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground font-500 mt-1 uppercase tracking-wider", children: label })
  ] });
}
function Countdown() {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1e3);
    return () => clearInterval(timer);
  }, []);
  if (!timeLeft) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-4", children: /* @__PURE__ */ jsx("span", { className: "font-display font-700 text-xl text-primary", children: "EVENT IS LIVE!" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-center", children: [
    /* @__PURE__ */ jsx(CountUnit, { value: timeLeft.days, label: "days" }),
    /* @__PURE__ */ jsx("span", { className: "font-display text-2xl text-muted-foreground self-start mt-3.5", children: ":" }),
    /* @__PURE__ */ jsx(CountUnit, { value: timeLeft.hours, label: "hrs" }),
    /* @__PURE__ */ jsx("span", { className: "font-display text-2xl text-muted-foreground self-start mt-3.5", children: ":" }),
    /* @__PURE__ */ jsx(CountUnit, { value: timeLeft.minutes, label: "min" }),
    /* @__PURE__ */ jsx("span", { className: "font-display text-2xl text-muted-foreground self-start mt-3.5", children: ":" }),
    /* @__PURE__ */ jsx(CountUnit, { value: timeLeft.seconds, label: "sec" })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const navCards = [
    {
      href: "/map",
      icon: "i-ph-map-trifold-duotone",
      title: "\u4F1A\u5834\u30DE\u30C3\u30D7",
      description: "\u30A8\u30EA\u30A2\u6848\u5185\u30FB\u65BD\u8A2D\u60C5\u5831",
      gradient: "from-blue-600/20 to-cyan-600/20"
    },
    {
      href: "/schedule",
      icon: "i-ph-clock-countdown-duotone",
      title: "\u30BF\u30A4\u30E0\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB",
      description: "\u30A4\u30D9\u30F3\u30C8\u9032\u884C\u8868",
      gradient: "from-emerald-600/20 to-teal-600/20"
    },
    {
      href: "/auction",
      icon: "i-ph-gavel-duotone",
      title: "\u30AA\u30FC\u30AF\u30B7\u30E7\u30F3",
      description: "13:00\u301C \u30C1\u30E3\u30EA\u30C6\u30A3\u30FC\u5165\u672D",
      gradient: "from-amber-600/20 to-orange-600/20"
    },
    {
      href: "/vote",
      icon: "i-ph-trophy-duotone",
      title: "\u8ECA\u4E21\u30B0\u30E9\u30F3\u30D7\u30EA\u6295\u7968",
      description: "\u301C13:30 \u304A\u6C17\u306B\u5165\u308A\u306E\u4E00\u53F0\u306B\u6295\u7968",
      gradient: "from-red-600/20 to-pink-600/20"
    }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-20" data-astro-cid-j7pv25f6>  <section class="relative px-5 pt-12 pb-8 overflow-hidden" data-astro-cid-j7pv25f6>  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/8 rounded-full blur-[100px] pointer-events-none" data-astro-cid-j7pv25f6></div> <div class="relative text-center" data-astro-cid-j7pv25f6>  <div class="inline-block mb-4" data-astro-cid-j7pv25f6> <span class="text-xs font-display font-600 tracking-[0.2em] uppercase text-muted-foreground px-3 py-1.5 border border-border rounded-pill bg-secondary/50" data-astro-cid-j7pv25f6>
水戸道楽TV presents
</span> </div>  <h1 class="mb-2" data-astro-cid-j7pv25f6> <span class="block font-display font-700 text-lg tracking-wider text-muted-foreground uppercase" data-astro-cid-j7pv25f6>
YouTuber
</span> <span class="block font-display font-900 text-4xl sm:text-5xl tracking-tight gold-shine bg-clip-text text-transparent leading-tight" data-astro-cid-j7pv25f6>
旧車サミット
</span> <span class="block font-display font-700 text-5xl sm:text-6xl chrome-text tracking-tighter mt-1" data-astro-cid-j7pv25f6>
2026
</span> </h1>  <div class="mt-5 space-y-1 text-sm text-muted-foreground" data-astro-cid-j7pv25f6> <p class="font-500" data-astro-cid-j7pv25f6> <span class="i-ph-calendar-duotone text-primary mr-1 align-middle" data-astro-cid-j7pv25f6></span>
2026年4月26日(日) 9:00〜15:00
</p> <p class="font-500" data-astro-cid-j7pv25f6> <span class="i-ph-map-pin-duotone text-primary mr-1 align-middle" data-astro-cid-j7pv25f6></span>
モビリティリゾートもてぎ 南コース
</p> <p class="text-xs text-muted-foreground/70" data-astro-cid-j7pv25f6>雨天決行</p> </div>  <div class="mt-8" data-astro-cid-j7pv25f6> ${renderComponent($$result2, "Countdown", Countdown, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/lifes/.Claude/kyusha-summit/src/components/Countdown", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} </div> </div> </section>  <section class="px-4 pb-6" data-astro-cid-j7pv25f6> <div class="grid grid-cols-2 gap-3 max-w-lg mx-auto" data-astro-cid-j7pv25f6> ${navCards.map((card, i) => renderTemplate`<a${addAttribute(card.href, "href")}${addAttribute(`card-base group hover:border-primary/40 transition-all bg-gradient-to-br ${card.gradient} backdrop-blur-sm`, "class")}${addAttribute(`animation: fadeInUp 0.5s ${i * 0.1}s both cubic-bezier(0.16,1,0.3,1)`, "style")} data-astro-cid-j7pv25f6> <span${addAttribute(`${card.icon} text-3xl text-primary mb-3 block group-hover:scale-110 transition-transform`, "class")} data-astro-cid-j7pv25f6></span> <h2 class="font-display font-700 text-sm tracking-tight text-foreground" data-astro-cid-j7pv25f6>${card.title}</h2> <p class="text-[11px] text-muted-foreground mt-1 leading-snug" data-astro-cid-j7pv25f6>${card.description}</p> <span class="i-ph-caret-right-bold absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-lg group-hover:text-primary/60 transition-colors" data-astro-cid-j7pv25f6></span> </a>`)} </div> </section>  <section class="px-4 pb-6" data-astro-cid-j7pv25f6> <div class="max-w-lg mx-auto card-base bg-secondary/30" data-astro-cid-j7pv25f6> <h3 class="font-display font-700 text-sm text-primary mb-3 tracking-wider uppercase flex items-center gap-2" data-astro-cid-j7pv25f6> <span class="i-ph-ticket-duotone text-lg" data-astro-cid-j7pv25f6></span>
チケット情報
</h3> <div class="space-y-2 text-sm" data-astro-cid-j7pv25f6> <div class="flex justify-between items-center py-1.5 border-b border-border/50" data-astro-cid-j7pv25f6> <span class="text-muted-foreground" data-astro-cid-j7pv25f6>展示車両チケット</span> <span class="font-display font-600 text-foreground" data-astro-cid-j7pv25f6>¥8,000/台</span> </div> <div class="flex justify-between items-center py-1.5 border-b border-border/50" data-astro-cid-j7pv25f6> <span class="text-muted-foreground" data-astro-cid-j7pv25f6>一般入場 (前売り)</span> <span class="font-display font-600 text-foreground" data-astro-cid-j7pv25f6>¥1,500/人</span> </div> <div class="flex justify-between items-center py-1.5 border-b border-border/50" data-astro-cid-j7pv25f6> <span class="text-muted-foreground" data-astro-cid-j7pv25f6>一般入場 (当日)</span> <span class="font-display font-600 text-foreground" data-astro-cid-j7pv25f6>¥2,500/人</span> </div> <p class="text-[11px] text-muted-foreground/70 mt-2 leading-relaxed" data-astro-cid-j7pv25f6>
※ 前売りチケットにはもてぎ入場料・駐車場代が含まれます。当日券は別途もてぎ入場料(大人¥1,900)・駐車場代(¥1,000)が必要です。
</p> </div> </div> </section> </main> ${renderComponent($$result2, "Nav", $$Nav, { "data-astro-cid-j7pv25f6": true })} ` })} `;
}, "C:/Users/lifes/.Claude/kyusha-summit/src/pages/index.astro", void 0);

const $$file = "C:/Users/lifes/.Claude/kyusha-summit/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
