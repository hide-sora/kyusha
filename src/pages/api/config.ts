import type { APIRoute } from 'astro';

const PB_URL = import.meta.env.PUBLIC_PB_URL || 'http://133.18.160.234:8093';

export const GET: APIRoute = async () => {
  const json = (str: string, status = 200) =>
    new Response(str, { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

  try {
    const res = await fetch(`${PB_URL}/api/collections/event_config/records?perPage=1`);
    const data = await res.json() as { items?: any[] };
    const config = data.items?.[0];

    return json(JSON.stringify({
      voting_open: config?.voting_open ?? false,
      auction_open: config?.auction_open ?? false,
      map_event: config?.map_event ?? false,
      ranking_visible: config?.ranking_visible ?? false,
    }));
  } catch {
    return json(JSON.stringify({ voting_open: false, auction_open: false, map_event: false, ranking_visible: false }));
  }
};
