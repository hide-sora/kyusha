/* empty css                                   */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$Nav } from '../chunks/Nav_DI6x8OHo.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect, useCallback } from 'react';
import { g as getPb, a as getDeviceId } from '../chunks/deviceId_BqEwbz_p.mjs';
import { z as zones } from '../chunks/zones_v-nS8VZT.mjs';
export { renderers } from '../renderers.mjs';

const VOTE_DEADLINE = /* @__PURE__ */ new Date("2026-04-26T13:30:00+09:00");
function isVotingOpen() {
  return Date.now() < VOTE_DEADLINE.getTime();
}
const ZONE_IDS = zones.map((z) => z.id);
function VotePage() {
  const [zone, setZone] = useState("A");
  const [number, setNumber] = useState("");
  const [ranking, setRanking] = useState([]);
  const [filterZone, setFilterZone] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [votingOpen, setVotingOpen] = useState(isVotingOpen);
  const [myVotes, setMyVotes] = useState([]);
  const lastVoteTime = useRef(0);
  const pb = getPb();
  useEffect(() => {
    const timer = setInterval(() => setVotingOpen(isVotingOpen()), 1e4);
    return () => clearInterval(timer);
  }, []);
  const fetchRanking = useCallback(async () => {
    try {
      const records = await pb.collection("car_votes").getFullList({
        fields: "car_number"
      });
      const counts = {};
      for (const r of records) {
        const cn = r.car_number;
        counts[cn] = (counts[cn] || 0) + 1;
      }
      const sorted = Object.entries(counts).map(([car_number, count]) => ({ car_number, count })).sort((a, b) => b.count - a.count);
      setRanking(sorted);
    } catch {
    }
  }, []);
  useEffect(() => {
    fetchRanking();
    const unsub = pb.collection("car_votes").subscribe("*", () => {
      fetchRanking();
    });
    return () => {
      unsub.then((fn) => fn());
    };
  }, [fetchRanking]);
  const handleVote = useCallback(async () => {
    if (Date.now() - lastVoteTime.current < 1e4) {
      setMessage("少し間をあけてから投票してください");
      return;
    }
    const carNumber = `${zone}${number.padStart(2, "0")}`;
    const numVal = parseInt(number);
    if (!number || numVal < 1 || numVal > 99) {
      setMessage("01〜99の数字を入力してください");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      await pb.collection("car_votes").create({
        car_number: carNumber,
        device_id: getDeviceId()
      });
      setMyVotes((prev) => [...prev, carNumber]);
      setMessage(`${carNumber} に投票しました!`);
      setNumber("");
      lastVoteTime.current = Date.now();
    } catch {
      setMessage("投票に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }, [zone, number]);
  const filteredRanking = filterZone ? ranking.filter((r) => r.car_number.startsWith(filterZone)) : ranking;
  return /* @__PURE__ */ jsxs("div", { className: "px-4 max-w-lg mx-auto space-y-5", children: [
    votingOpen ? /* @__PURE__ */ jsxs("div", { className: "card-base bg-gradient-to-br from-red-600/10 to-pink-600/10", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-display font-700 text-sm text-primary mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "i-ph-car-profile-duotone text-lg" }),
        "お気に入りの一台に投票"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-muted-foreground block mb-1", children: "ゾーン" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: ZONE_IDS.map((z) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setZone(z),
              className: `w-10 h-10 rounded-lg font-display font-700 text-sm transition-all ${zone === z ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:border-primary/40"}`,
              children: z
            },
            z
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-muted-foreground block mb-1", children: "番号 (01〜99)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              placeholder: "01",
              value: number,
              onChange: (e) => {
                const v = e.target.value;
                if (v.length <= 2) setNumber(v);
              },
              min: 1,
              max: 99,
              className: "w-full bg-secondary border border-border rounded-button px-4 py-2 text-center font-display font-700 text-xl text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary transition-colors tabular-nums"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleVote,
            disabled: submitting || !number,
            className: "btn-primary h-10 px-5 shrink-0 disabled:opacity-50",
            children: submitting ? "..." : "投票"
          }
        )
      ] }),
      number && /* @__PURE__ */ jsxs("p", { className: "text-center mt-3 font-display font-700 text-2xl text-foreground", children: [
        zone,
        number.padStart(2, "0")
      ] }),
      message && /* @__PURE__ */ jsx("p", { className: `text-xs mt-2 ${message.includes("失敗") || message.includes("間を") ? "text-destructive" : "text-primary"}`, children: message })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "card-base text-center py-6", children: [
      /* @__PURE__ */ jsx("span", { className: "i-ph-flag-checkered-duotone text-4xl text-muted-foreground/30 block mb-2" }),
      /* @__PURE__ */ jsx("p", { className: "font-700 text-foreground", children: "投票は締め切りました" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "13:30をもって終了しました" })
    ] }),
    myVotes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5 px-1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground mr-1 self-center", children: "あなたの投票:" }),
      myVotes.map((v, i) => /* @__PURE__ */ jsx("span", { className: "text-xs font-display font-700 bg-primary/10 text-primary px-2 py-0.5 rounded-md", children: v }, i))
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-display font-700 text-sm text-muted-foreground tracking-wider uppercase flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "i-ph-trophy-duotone text-primary text-lg" }),
          "ランキング"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setFilterZone(null),
              className: `px-2 py-0.5 rounded-md text-[10px] font-600 transition-colors ${!filterZone ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: "ALL"
            }
          ),
          ZONE_IDS.map((z) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setFilterZone(z),
              className: `px-2 py-0.5 rounded-md text-[10px] font-600 transition-colors ${filterZone === z ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: z
            },
            z
          ))
        ] })
      ] }),
      filteredRanking.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "まだ投票がありません" }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: filteredRanking.slice(0, 30).map((entry, i) => {
        const zoneData = zones.find((z) => entry.car_number.startsWith(z.id));
        const isTop3 = i < 3;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isTop3 ? "bg-primary/5 border border-primary/20" : "bg-card border border-border"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: `font-display font-700 text-sm w-6 text-center ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`, children: i + 1 }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-6 h-6 rounded text-[10px] font-700 text-white flex-center shrink-0",
                  style: { backgroundColor: zoneData?.color || "#666" },
                  children: entry.car_number.charAt(0)
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "font-display font-700 text-foreground flex-1", children: entry.car_number }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-2 rounded-full bg-primary/30",
                    style: { width: `${Math.min(entry.count / (filteredRanking[0]?.count || 1) * 60, 60)}px` }
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "font-display font-700 text-sm text-primary tabular-nums w-8 text-right", children: entry.count })
              ] })
            ]
          },
          entry.car_number
        );
      }) })
    ] })
  ] });
}

const $$Vote = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u8ECA\u4E21\u30B0\u30E9\u30F3\u30D7\u30EA\u6295\u7968" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-20 pt-6"> <header class="px-5 mb-6"> <h1 class="section-title text-foreground"> <span class="i-ph-trophy-duotone text-primary mr-2 align-middle"></span>
車両グランプリ投票
</h1> <p class="text-xs text-muted-foreground mt-1">投票締切: 13:30</p> </header> ${renderComponent($$result2, "VotePage", VotePage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/lifes/.Claude/kyusha-summit/src/components/Vote/VotePage", "client:component-export": "default" })} </main> ${renderComponent($$result2, "Nav", $$Nav, {})} ` })}`;
}, "C:/Users/lifes/.Claude/kyusha-summit/src/pages/vote.astro", void 0);

const $$file = "C:/Users/lifes/.Claude/kyusha-summit/src/pages/vote.astro";
const $$url = "/vote";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Vote,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
