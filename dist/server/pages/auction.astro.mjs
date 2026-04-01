/* empty css                                   */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$Nav } from '../chunks/Nav_DI6x8OHo.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect, useCallback } from 'react';
import { g as getPb, a as getDeviceId } from '../chunks/deviceId_BqEwbz_p.mjs';
export { renderers } from '../renderers.mjs';

function formatYen(n) {
  return `¥${n.toLocaleString()}`;
}
function ItemCard({
  item,
  isSelected,
  onSelect
}) {
  const statusLabel = {
    upcoming: { text: "開始前", class: "bg-secondary text-muted-foreground" },
    live: { text: "LIVE", class: "bg-red-500/90 text-white" },
    ended: { text: "終了", class: "bg-muted text-muted-foreground" }
  }[item.status];
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: onSelect,
      className: `card-base w-full text-left transition-all ${isSelected ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/30"}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg bg-secondary flex-center shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx("span", { className: "i-ph-gavel-duotone text-2xl text-muted-foreground/30" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-700 px-1.5 py-0.5 rounded-md ${statusLabel.class}`, children: statusLabel.text }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground truncate", children: item.youtuber_name })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "font-700 text-sm text-foreground truncate", children: item.title }),
          /* @__PURE__ */ jsx("p", { className: "font-display font-700 text-primary text-lg mt-1", children: formatYen(item.current_price || item.start_price) })
        ] })
      ] })
    }
  );
}
function BidPanel({ item }) {
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const pb = getPb();
  useEffect(() => {
    pb.collection("auction_bids").getList(1, 20, {
      filter: `item = "${item.id}"`,
      sort: "-amount"
    }).then((res) => setBids(res.items)).catch(() => {
    });
    const unsub = pb.collection("auction_bids").subscribe("*", (e) => {
      if (e.action === "create") {
        const bid = e.record;
        setBids((prev) => [bid, ...prev].sort((a, b) => b.amount - a.amount).slice(0, 20));
      }
    });
    return () => {
      unsub.then((fn) => fn());
    };
  }, [item.id]);
  const handleBid = useCallback(async () => {
    setError("");
    const amount = parseInt(bidAmount);
    if (!amount || amount <= (item.current_price || item.start_price)) {
      setError(`現在の価格 ${formatYen(item.current_price || item.start_price)} より高い金額を入力してください`);
      return;
    }
    if (!nickname.trim()) {
      setError("ニックネームを入力してください");
      return;
    }
    setSubmitting(true);
    try {
      await pb.collection("auction_bids").create({
        item: item.id,
        amount,
        bidder_name: nickname.trim(),
        device_id: getDeviceId()
      });
      setBidAmount("");
    } catch (e) {
      setError("入札に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }, [bidAmount, nickname, item]);
  const minBid = (item.current_price || item.start_price) + 100;
  return /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center py-4 bg-primary/5 rounded-card border border-primary/20", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "現在の最高額" }),
      /* @__PURE__ */ jsx("p", { className: "font-display font-900 text-3xl text-primary", children: formatYen(item.current_price || item.start_price) })
    ] }),
    item.status === "live" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "ニックネーム",
          value: nickname,
          onChange: (e) => setNickname(e.target.value),
          className: "w-full bg-secondary border border-border rounded-button px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors",
          maxLength: 20
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            placeholder: `${formatYen(minBid)}〜`,
            value: bidAmount,
            onChange: (e) => setBidAmount(e.target.value),
            className: "flex-1 bg-secondary border border-border rounded-button px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors tabular-nums",
            min: minBid,
            step: 100
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBid,
            disabled: submitting,
            className: "btn-primary px-5 shrink-0 disabled:opacity-50",
            children: submitting ? "..." : "入札"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: [100, 500, 1e3, 5e3].map((inc) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setBidAmount(String((item.current_price || item.start_price) + inc)),
          className: "px-3 py-1.5 bg-secondary border border-border rounded-button text-xs font-600 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors",
          children: [
            "+",
            formatYen(inc)
          ]
        },
        inc
      )) }),
      error && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error })
    ] }),
    item.status === "upcoming" && /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
      /* @__PURE__ */ jsx("span", { className: "i-ph-clock-countdown-duotone text-4xl text-muted-foreground/30 block mb-2" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "オークション開始までお待ちください" })
    ] }),
    bids.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2", children: "入札履歴" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1", children: bids.slice(0, 10).map((bid, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex justify-between items-center px-3 py-2 rounded-lg text-sm ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "font-500", children: bid.bidder_name }),
            /* @__PURE__ */ jsx("span", { className: "font-display font-700 tabular-nums", children: formatYen(bid.amount) })
          ]
        },
        bid.id
      )) })
    ] })
  ] });
}
function AuctionPage() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const pb = getPb();
  useEffect(() => {
    pb.collection("auction_items").getFullList({ sort: "start_time" }).then((res) => {
      const list = res;
      setItems(list);
      if (list.length > 0) setSelectedId(list[0].id);
    }).catch(() => {
    }).finally(() => setLoading(false));
    const unsub = pb.collection("auction_items").subscribe("*", (e) => {
      if (e.action === "update") {
        setItems((prev) => prev.map(
          (item) => item.id === e.record.id ? { ...item, ...e.record } : item
        ));
      }
    });
    return () => {
      unsub.then((fn) => fn());
    };
  }, []);
  const selectedItem = items.find((i) => i.id === selectedId);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex-center py-20", children: /* @__PURE__ */ jsx("span", { className: "i-ph-spinner-bold text-2xl text-muted-foreground animate-spin" }) });
  }
  if (items.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "px-4 max-w-lg mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "card-base text-center py-10 bg-gradient-to-br from-amber-600/10 to-orange-600/10", children: [
      /* @__PURE__ */ jsx("span", { className: "i-ph-gavel-duotone text-6xl text-primary block mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "font-display font-700 text-xl text-foreground mb-2", children: "チャリティーオークション" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-4 leading-relaxed", children: [
        "各YouTuberが用意したとっておきの出品物を",
        /* @__PURE__ */ jsx("br", {}),
        "専用アプリでオークション!",
        /* @__PURE__ */ jsx("br", {}),
        "参加は会場者全員可能です。"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-pill px-4 py-2", children: [
        /* @__PURE__ */ jsx("span", { className: "i-ph-clock-countdown-duotone text-primary text-lg" }),
        /* @__PURE__ */ jsx("span", { className: "font-display font-700 text-primary text-lg", children: "13:00 START" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "px-4 max-w-lg mx-auto space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-primary/10 border border-primary/30 rounded-card px-4 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "i-ph-megaphone-duotone text-2xl text-primary shrink-0" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-700 text-sm text-primary", children: "チャリティーオークション開催中!" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "各YouTuberの出品物に入札しよう" })
      ] })
    ] }),
    items.map((item) => /* @__PURE__ */ jsx(
      ItemCard,
      {
        item,
        isSelected: item.id === selectedId,
        onSelect: () => setSelectedId(item.id)
      },
      item.id
    )),
    selectedItem && /* @__PURE__ */ jsx(BidPanel, { item: selectedItem })
  ] });
}

const $$Auction = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u30AA\u30FC\u30AF\u30B7\u30E7\u30F3" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-20 pt-6"> <header class="px-5 mb-6"> <h1 class="section-title text-foreground"> <span class="i-ph-gavel-duotone text-primary mr-2 align-middle"></span>
オークション
</h1> <p class="text-xs text-muted-foreground mt-1">13:00〜 チャリティーオークション</p> </header> ${renderComponent($$result2, "AuctionPage", AuctionPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/lifes/.Claude/kyusha-summit/src/components/Auction/AuctionPage", "client:component-export": "default" })} </main> ${renderComponent($$result2, "Nav", $$Nav, {})} ` })}`;
}, "C:/Users/lifes/.Claude/kyusha-summit/src/pages/auction.astro", void 0);

const $$file = "C:/Users/lifes/.Claude/kyusha-summit/src/pages/auction.astro";
const $$url = "/auction";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Auction,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
