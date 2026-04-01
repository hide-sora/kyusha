/* empty css                                   */
import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_y1XpGNYX.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$Nav } from '../chunks/Nav_DI6x8OHo.mjs';
import { z as zones } from '../chunks/zones_v-nS8VZT.mjs';
export { renderers } from '../renderers.mjs';

const $$Map = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u4F1A\u5834\u30DE\u30C3\u30D7" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-20 pt-6"> <header class="px-5 mb-6"> <h1 class="section-title text-foreground"> <span class="i-ph-map-trifold-duotone text-primary mr-2 align-middle"></span>
会場マップ
</h1> <p class="text-xs text-muted-foreground mt-1">モビリティリゾートもてぎ 南コース</p> </header>  <section class="px-4 mb-6"> <div class="card-base aspect-[4/3] flex-center bg-secondary/30 overflow-hidden"> <div class="text-center"> <span class="i-ph-map-trifold-duotone text-6xl text-muted-foreground/20 block mb-3"></span> <p class="text-sm text-muted-foreground">会場マップ準備中</p> <p class="text-xs text-muted-foreground/60 mt-1">Figmaデザイン完成後に差し替え</p> </div> </div> </section>  <section class="px-4"> <h2 class="font-display font-700 text-sm text-muted-foreground tracking-wider uppercase mb-3 px-1">
展示エリア
</h2> <div class="space-y-2 max-w-lg mx-auto"> ${zones.map((zone) => renderTemplate`<div class="card-base flex items-center gap-4 py-3.5 px-4"> <div class="w-10 h-10 rounded-lg flex-center font-display font-700 text-lg text-white shrink-0"${addAttribute(`background-color: ${zone.color}`, "style")}> ${zone.id} </div> <div class="flex-1 min-w-0"> <h3 class="font-700 text-sm text-foreground">${zone.name}</h3> <p class="text-xs text-muted-foreground truncate">${zone.description}</p> </div> <div class="text-right shrink-0"> <span class="font-display font-700 text-lg text-foreground">${zone.carCount}</span> <span class="text-[10px] text-muted-foreground block">台</span> </div> </div>`)} </div> </section> </main> ${renderComponent($$result2, "Nav", $$Nav, {})} ` })}`;
}, "C:/Users/lifes/.Claude/kyusha-summit/src/pages/map.astro", void 0);

const $$file = "C:/Users/lifes/.Claude/kyusha-summit/src/pages/map.astro";
const $$url = "/map";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Map,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
