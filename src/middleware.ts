import { defineMiddleware } from 'astro:middleware';

const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';
const VISITOR_COOKIE = 'kyusha_vid';

// 静的アセット・API・ボットスキャン等はトラッキングしない
const SKIP = /^\/(api|_astro|favicon|map\/|auction\/.*\.(jpg|png|svg)|mito-logo|robots\.txt|sw\.js|apple-touch-icon|wp-|wordpress|blog\/|web\/|wp\/|cms\/|shop\/|site\/|news\/|test\/|sito\/|website\/|2019\/|2020\/|xmlrpc|\.env|\.git|\.php)/i;

function randomId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // レスポンスを先に返す
  const response = await next();

  // 静的ファイル・API・abc自体はスキップ
  if (SKIP.test(path) || path === '/abc') return response;

  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  // 訪問者ID（Cookie）
  const cookieHeader = request.headers.get('cookie');
  let visitorId = readCookie(cookieHeader, VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = randomId();
    // 1年間有効のCookieをセット
    response.headers.append(
      'Set-Cookie',
      `${VISITOR_COOKIE}=${visitorId}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
    );
  }

  // バックグラウンドで記録（レスポンスをブロックしない）
  const referrer = request.headers.get('referer') || '';
  const ua = request.headers.get('user-agent') || '';
  fetch(`${PB_URL}/api/collections/page_views/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: path || '/',
      device_id: visitorId,
      referrer: referrer.slice(0, 500),
      user_agent: ua.slice(0, 500),
    }),
  }).catch(() => {
    // ログ失敗は無視（コレクション未作成など）
  });

  return response;
});
