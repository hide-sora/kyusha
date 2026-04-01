/* empty css                                   */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$Nav } from '../chunks/Nav_DI6x8OHo.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
export { renderers } from '../renderers.mjs';

function hm(h, m) {
  return h * 60 + m;
}
const scheduleEvents = [
  {
    time: "8:00",
    title: "ゲートオープン",
    description: "南ゲートよりお入りください",
    location: "南ゲート",
    startMinutes: hm(8, 0),
    endMinutes: hm(9, 0)
  },
  {
    time: "9:00",
    title: "イベント開始",
    description: "モビリティリゾートもてぎ南コース",
    startMinutes: hm(9, 0),
    endMinutes: hm(10, 0)
  },
  {
    time: "10:00",
    title: "開会式",
    description: "イベントステージウィング車両にて",
    location: "イベントステージ",
    highlight: true,
    startMinutes: hm(10, 0),
    endMinutes: hm(11, 0)
  },
  {
    time: "11:00",
    title: "自動車系YouTuber勢揃い! トークショー",
    description: "イベントステージウィング車両にて",
    location: "イベントステージ",
    highlight: true,
    startMinutes: hm(11, 0),
    endMinutes: hm(12, 0)
  },
  {
    time: "12:00",
    title: "切削サイコロノベルティ抽選会",
    description: "有限会社小林製作所ブースにて",
    location: "小林製作所ブース",
    startMinutes: hm(12, 0),
    endMinutes: hm(13, 0)
  },
  {
    time: "13:00",
    title: "チャリティーオークション",
    description: "YouTuberが用意したとっておきの出品物を専用アプリでオークション。参加は会場者全員可能です!",
    location: "アプリ内",
    highlight: true,
    startMinutes: hm(13, 0),
    endMinutes: hm(13, 30)
  },
  {
    time: "13:30",
    title: "イベント車両グランプリ投票締切",
    description: "水戸道楽TVブースにて",
    location: "水戸道楽TVブース",
    highlight: true,
    startMinutes: hm(13, 30),
    endMinutes: hm(14, 0)
  },
  {
    time: "14:00",
    title: "水戸道楽TV イベント会場散策",
    description: "時間が許す限りイベント会場を歩いて回り、協賛ブースや皆様の愛車を見せていただきます!",
    startMinutes: hm(14, 0),
    endMinutes: hm(14, 30)
  },
  {
    time: "14:30",
    title: "エントリー車両グランプリ & 各賞発表 & 閉会式",
    description: "イベントステージウィング車両にて",
    location: "イベントステージ",
    highlight: true,
    startMinutes: hm(14, 30),
    endMinutes: hm(15, 0)
  },
  {
    time: "15:00",
    title: "車両退場開始",
    description: "南コースの契約関係上、速やかに退場協力お願いします",
    startMinutes: hm(15, 0),
    endMinutes: hm(16, 0)
  }
];

function getNowMinutes() {
  const now = /* @__PURE__ */ new Date();
  return now.getHours() * 60 + now.getMinutes();
}
function EventCard({ event, isActive, isPast }) {
  return /* @__PURE__ */ jsxs("div", { className: `relative flex gap-4 ${isPast ? "opacity-40" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center shrink-0 w-12", children: [
      /* @__PURE__ */ jsx("span", { className: "font-display font-600 text-xs text-muted-foreground tabular-nums", children: event.time }),
      /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full mt-2 border-2 shrink-0 ${isActive ? "bg-primary border-primary shadow-[0_0_10px_hsl(42,85%,55%)]" : isPast ? "bg-muted-foreground/30 border-muted-foreground/30" : "bg-secondary border-border"}` }),
      /* @__PURE__ */ jsx("div", { className: "w-px flex-1 bg-border mt-1" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `flex-1 pb-6 pt-0.5 ${isActive ? "" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: `rounded-card p-4 transition-all ${isActive ? "bg-primary/10 border border-primary/30" : "bg-card border border-border"}`, children: [
      isActive && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-display font-700 text-primary uppercase tracking-wider mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse" }),
        "NOW"
      ] }),
      /* @__PURE__ */ jsx("h3", { className: `font-700 text-sm leading-snug ${event.highlight ? "text-primary" : "text-foreground"}`, children: event.title }),
      event.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1.5 leading-relaxed", children: event.description }),
      event.location && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "i-ph-map-pin-duotone text-sm" }),
        event.location
      ] })
    ] }) })
  ] });
}
function Timeline() {
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);
  useEffect(() => {
    const timer = setInterval(() => setNowMinutes(getNowMinutes()), 3e4);
    return () => clearInterval(timer);
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "px-4 max-w-lg mx-auto", children: scheduleEvents.map((event, i) => {
    const isActive = nowMinutes >= event.startMinutes && nowMinutes < event.endMinutes;
    const isPast = nowMinutes >= event.endMinutes;
    return /* @__PURE__ */ jsx(EventCard, { event, isActive, isPast }, i);
  }) });
}

const $$Schedule = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u30BF\u30A4\u30E0\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-20 pt-6"> <header class="px-5 mb-6"> <h1 class="section-title text-foreground"> <span class="i-ph-clock-countdown-duotone text-primary mr-2 align-middle"></span>
タイムスケジュール
</h1> <p class="text-xs text-muted-foreground mt-1">2026年4月26日(日) 9:00〜15:00</p> </header> ${renderComponent($$result2, "Timeline", Timeline, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/lifes/.Claude/kyusha-summit/src/components/Schedule/Timeline", "client:component-export": "default" })} </main> ${renderComponent($$result2, "Nav", $$Nav, {})} ` })}`;
}, "C:/Users/lifes/.Claude/kyusha-summit/src/pages/schedule.astro", void 0);

const $$file = "C:/Users/lifes/.Claude/kyusha-summit/src/pages/schedule.astro";
const $$url = "/schedule";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Schedule,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
