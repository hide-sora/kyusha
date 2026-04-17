import { defineMiddleware } from 'astro:middleware';

const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';

let pbToken: string | null = null;
let tokenTime = 0;

async function getPbToken(): Promise<string> {
  // トークンを10分キャッシュ
  if (pbToken && Date.now() - tokenTime < 600_000) return pbToken;
  try {
    const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: import.meta.env.PB_SUPERUSER_EMAIL,
        password: import.meta.env.PB_SUPERUSER_PASSWORD,
      }),
    });
    const data = (await res.json()) as { token?: string };
    pbToken = data.token || '';
    tokenTime = Date.now();
    return pbToken;
  } catch {
    return '';
  }
}

let collectionReady = false;

async function ensurePageViewsCollection(token: string): Promise<void> {
  if (collectionReady) return;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: token,
  };

  const check = await fetch(`${PB_URL}/api/collections/page_views`, { headers });
  if (check.ok) {
    collectionReady = true;
    return;
  }

  await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'page_views',
      type: 'base',
      fields: [
        { name: 'path', type: 'text' },
        { name: 'referrer', type: 'text' },
        { name: 'user_agent', type: 'text' },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
    }),
  });
  collectionReady = true;
}

// 静的アセットとAPIはトラッキングしない
const SKIP = /^\/(api|_astro|favicon|map\/|auction\/.*\.(jpg|png|svg)|mito-logo)/;

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // レスポンスを先に返す（ノンブロッキングで記録）
  const response = await next();

  // 静的ファイル・API・abc自体はスキップ
  if (SKIP.test(path) || path === '/abc') return response;

  // HTMLページのみ記録
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  // バックグラウンドで記録（レスポンスをブロックしない）
  try {
    const token = await getPbToken();
    if (token) {
      await ensurePageViewsCollection(token);
      const referrer = request.headers.get('referer') || '';
      const ua = request.headers.get('user-agent') || '';
      fetch(`${PB_URL}/api/collections/page_views/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({
          path: path || '/',
          referrer,
          user_agent: ua.slice(0, 500),
        }),
      }).catch(() => {});
    }
  } catch {
    // ログ失敗は無視
  }

  return response;
});
