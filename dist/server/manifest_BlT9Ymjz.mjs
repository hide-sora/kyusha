import 'piccolore';
import { o as decodeKey } from './chunks/astro/server_y1XpGNYX.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Id5NDMBP.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/lifes/.Claude/kyusha-summit/","cacheDir":"file:///C:/Users/lifes/.Claude/kyusha-summit/node_modules/.astro/","outDir":"file:///C:/Users/lifes/.Claude/kyusha-summit/dist/","srcDir":"file:///C:/Users/lifes/.Claude/kyusha-summit/src/","publicDir":"file:///C:/Users/lifes/.Claude/kyusha-summit/public/","buildClientDir":"file:///C:/Users/lifes/.Claude/kyusha-summit/dist/client/","buildServerDir":"file:///C:/Users/lifes/.Claude/kyusha-summit/dist/server/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/auction.BklLwyzM.css"}],"routeData":{"route":"/auction","isIndex":false,"type":"page","pattern":"^\\/auction\\/?$","segments":[[{"content":"auction","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auction.astro","pathname":"/auction","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/auction.BklLwyzM.css"}],"routeData":{"route":"/map","isIndex":false,"type":"page","pattern":"^\\/map\\/?$","segments":[[{"content":"map","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/map.astro","pathname":"/map","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/auction.BklLwyzM.css"}],"routeData":{"route":"/schedule","isIndex":false,"type":"page","pattern":"^\\/schedule\\/?$","segments":[[{"content":"schedule","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/schedule.astro","pathname":"/schedule","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/auction.BklLwyzM.css"}],"routeData":{"route":"/vote","isIndex":false,"type":"page","pattern":"^\\/vote\\/?$","segments":[[{"content":"vote","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/vote.astro","pathname":"/vote","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/auction.BklLwyzM.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/lifes/.Claude/kyusha-summit/src/pages/auction.astro",{"propagation":"none","containsHead":true}],["C:/Users/lifes/.Claude/kyusha-summit/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/lifes/.Claude/kyusha-summit/src/pages/map.astro",{"propagation":"none","containsHead":true}],["C:/Users/lifes/.Claude/kyusha-summit/src/pages/schedule.astro",{"propagation":"none","containsHead":true}],["C:/Users/lifes/.Claude/kyusha-summit/src/pages/vote.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/auction@_@astro":"pages/auction.astro.mjs","\u0000@astro-page:src/pages/map@_@astro":"pages/map.astro.mjs","\u0000@astro-page:src/pages/schedule@_@astro":"pages/schedule.astro.mjs","\u0000@astro-page:src/pages/vote@_@astro":"pages/vote.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BlT9Ymjz.mjs","C:/Users/lifes/.Claude/kyusha-summit/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_COtHaKzy.mjs","C:/Users/lifes/.Claude/kyusha-summit/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_CYvY0z_m.mjs","C:/Users/lifes/.Claude/kyusha-summit/src/components/Countdown":"_astro/Countdown.DbeAUOmh.js","C:/Users/lifes/.Claude/kyusha-summit/src/components/Schedule/Timeline":"_astro/Timeline.D2BvWje2.js","C:/Users/lifes/.Claude/kyusha-summit/src/components/Auction/AuctionPage":"_astro/AuctionPage.Bpv9eUFv.js","C:/Users/lifes/.Claude/kyusha-summit/src/components/Vote/VotePage":"_astro/VotePage.1QAiziRZ.js","@astrojs/react/client.js":"_astro/client.C5Auakxu.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/auction.BklLwyzM.css","/favicon.svg","/_astro/AuctionPage.Bpv9eUFv.js","/_astro/client.C5Auakxu.js","/_astro/Countdown.DbeAUOmh.js","/_astro/deviceId.H7Adh8Mp.js","/_astro/index.DiEladB3.js","/_astro/jsx-runtime.D_zvdyIk.js","/_astro/Timeline.D2BvWje2.js","/_astro/VotePage.1QAiziRZ.js"],"buildFormat":"directory","checkOrigin":false,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"kMHSX1TlD6NUzMbbInajPSuXLjiSCLn+BWvxO2UPpdo=","sessionConfig":{"driver":"fs-lite","options":{"base":"C:\\Users\\lifes\\.Claude\\kyusha-summit\\node_modules\\.astro\\sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/fs-lite_COtHaKzy.mjs');

export { manifest };
