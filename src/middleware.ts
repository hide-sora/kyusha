import { defineMiddleware } from 'astro:middleware';

const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';
const VISITOR_COOKIE = 'kyusha_vid';
const EXCLUDE_COOKIE = 'kyusha_analytics_exclude';

// 静的アセット・API・ボットスキャン等はトラッキングしない
const SKIP = /^\/(api|_astro|favicon|map\/|auction\/.*\.(jpg|png|svg)|mito-logo|robots\.txt|sw\.js|apple-touch-icon|wp-|wordpress|blog\/|web\/|wp\/|cms\/|shop\/|site\/|news\/|test\/|sito\/|website\/|2019\/|2020\/|xmlrpc|\.env|\.git|\.php)/i;

// 管理者系のパス（ここを見た人＝管理者として自動で計測対象から除外）
const ADMIN_PATHS = new Set(['/abc', '/admin']);

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

const ONE_YEAR = 60 * 60 * 24 * 365;

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // レスポンスを先に返す
  const response = await next();

  const cookieHeader = request.headers.get('cookie');
  const excluded = readCookie(cookieHeader, EXCLUDE_COOKIE) === '1';

  // 管理者パスに来た人には除外Cookieを付与（以降のアクセスは計測しない）
  if (ADMIN_PATHS.has(path) && !excluded) {
    response.headers.append(
      'Set-Cookie',
      `${EXCLUDE_COOKIE}=1; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`,
    );
  }

  // 静的ファイル・API・管理者パス・除外対象はスキップ
  if (SKIP.test(path) || ADMIN_PATHS.has(path) || excluded) return response;

  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  // 訪問者ID（Cookie）
  let visitorId = readCookie(cookieHeader, VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = randomId();
    response.headers.append(
      'Set-Cookie',
      `${VISITOR_COOKIE}=${visitorId}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`,
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
    // ログ失敗は無視
  });

  return response;
});
