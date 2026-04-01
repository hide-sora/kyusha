import { e as createComponent, g as addAttribute, l as renderHead, n as renderSlot, r as renderTemplate, h as createAstro, m as maybeRenderHead } from './astro/server_y1XpGNYX.mjs';
import 'piccolore';
import 'clsx';
/* empty css                           */

const $$Astro$1 = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "\u65E7\u8ECA\u30B5\u30DF\u30C3\u30C82026", description = "\u6C34\u6238\u9053\u697DTV YouTuber \u65E7\u8ECA\u30B5\u30DF\u30C3\u30C82026 \u516C\u5F0F\u30A2\u30D7\u30EA" } = Astro2.props;
  const fullTitle = title === "\u65E7\u8ECA\u30B5\u30DF\u30C3\u30C82026" ? title : `${title} | \u65E7\u8ECA\u30B5\u30DF\u30C3\u30C82026`;
  return renderTemplate`<html lang="ja"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="description"${addAttribute(description, "content")}><meta name="theme-color" content="#131720"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${fullTitle}</title>${renderHead()}</head> <body class="layout-base retro-stripe"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/lifes/.Claude/kyusha-summit/src/layouts/Layout.astro", void 0);

const $$Astro = createAstro();
const $$Nav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Nav;
  const currentPath = Astro2.url.pathname;
  const navItems = [
    { href: "/", label: "TOP", icon: "i-ph-flag-checkered-duotone" },
    { href: "/map", label: "MAP", icon: "i-ph-map-trifold-duotone" },
    { href: "/schedule", label: "TIME", icon: "i-ph-clock-countdown-duotone" },
    { href: "/auction", label: "BID", icon: "i-ph-gavel-duotone" },
    { href: "/vote", label: "VOTE", icon: "i-ph-trophy-duotone" }
  ];
  return renderTemplate`${maybeRenderHead()}<nav class="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-area-bottom" data-astro-cid-m6gy25n3> <div class="flex justify-around items-center h-16 max-w-lg mx-auto px-2" data-astro-cid-m6gy25n3> ${navItems.map((item) => {
    const isActive = currentPath === item.href || item.href !== "/" && currentPath.startsWith(item.href);
    return renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute([
      "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
    ], "class:list")} data-astro-cid-m6gy25n3> <span${addAttribute([item.icon, "text-xl", isActive && "drop-shadow-[0_0_6px_hsl(42,85%,55%)]"], "class:list")} data-astro-cid-m6gy25n3></span> <span class="text-[10px] font-display font-600 tracking-wider" data-astro-cid-m6gy25n3>${item.label}</span> </a>`;
  })} </div> </nav> `;
}, "C:/Users/lifes/.Claude/kyusha-summit/src/components/common/Nav.astro", void 0);

export { $$Layout as $, $$Nav as a };
