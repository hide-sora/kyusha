import type { APIRoute } from 'astro';

const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';

async function getPbToken(): Promise<string> {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: import.meta.env.PB_SUPERUSER_EMAIL,
      password: import.meta.env.PB_SUPERUSER_PASSWORD,
    }),
  });
  const data = await res.json() as { token?: string };
  return data.token || '';
}

const PV_FIELDS = [
  { name: 'path', type: 'text' },
  { name: 'device_id', type: 'text' },
  { name: 'referrer', type: 'text' },
  { name: 'user_agent', type: 'text' },
];

async function ensurePageViewsCollection(headers: Record<string, string>): Promise<void> {
  const check = await fetch(`${PB_URL}/api/collections/page_views`, { headers });
  if (check.ok) return;

  await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'page_views',
      type: 'base',
      fields: PV_FIELDS,
      listRule: '',
      viewRule: '',
      createRule: '',
    }),
  });
}

export const POST: APIRoute = async ({ request }) => {
  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const { path, device_id, referrer, user_agent } = body;
  if (!path || !device_id) return json({ error: 'path and device_id required' }, 400);

  const token = await getPbToken();
  if (!token) return json({ error: 'PB auth failed' }, 500);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': token,
  };

  await ensurePageViewsCollection(headers);

  await fetch(`${PB_URL}/api/collections/page_views/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      path: String(path).slice(0, 200),
      device_id: String(device_id).slice(0, 64),
      referrer: String(referrer || '').slice(0, 200),
      user_agent: String(user_agent || '').slice(0, 120),
    }),
  });

  return json({ ok: true });
};
