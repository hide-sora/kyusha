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

/* ---------- event_config コレクション管理 ---------- */

const CONFIG_FIELDS = [
  { name: 'voting_open', type: 'bool' },
  { name: 'auction_open', type: 'bool' },
  { name: 'map_event', type: 'bool' },
  { name: 'ranking_visible', type: 'bool' },
];

async function ensureConfigCollection(headers: Record<string, string>): Promise<void> {
  const check = await fetch(`${PB_URL}/api/collections/event_config`, { headers });
  if (check.ok) {
    // 既存コレクションにフィールド追加を試みる
    const col = await check.json() as { fields?: { name: string }[] };
    const existing = (col.fields || []).map((f: any) => f.name);
    const missing = CONFIG_FIELDS.filter(f => !existing.includes(f.name));
    if (missing.length > 0) {
      await fetch(`${PB_URL}/api/collections/event_config`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields: [...(col.fields || []), ...missing] }),
      });
    }
    return;
  }

  await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'event_config',
      type: 'base',
      fields: CONFIG_FIELDS,
      listRule: '',
      viewRule: '',
    }),
  });
}

async function getConfigRecord(headers: Record<string, string>): Promise<any> {
  await ensureConfigCollection(headers);

  const res = await fetch(`${PB_URL}/api/collections/event_config/records?perPage=1`, { headers });
  const data = await res.json() as { items?: any[] };
  if (data.items && data.items.length > 0) return data.items[0];

  // 初回: レコード作成
  const create = await fetch(`${PB_URL}/api/collections/event_config/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ voting_open: false, auction_open: false }),
  });
  return create.json();
}

/* ---------- サンプルデータ ---------- */

const SAMPLE_AUCTION_ITEMS = [
  { title: 'サイン入りヘルメット', description: '水戸道楽TV 愛用のヘルメット', youtuber_name: '水戸道楽TV', start_price: 3000 },
  { title: 'レストア工具セット', description: '板金塗装レストアGTで実際に使用', youtuber_name: '車の板金塗装レストアGT', start_price: 5000 },
  { title: 'オリジナルTシャツ', description: 'とよちゃんガレージ限定デザイン', youtuber_name: 'とよちゃんガレージ', start_price: 1000 },
];

/* ---------- API ---------- */

export const POST: APIRoute = async ({ request }) => {
  const json = (str: string, status = 200) =>
    new Response(str, { status, headers: { 'Content-Type': 'application/json' } });

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return json(JSON.stringify({ error: 'Invalid request' }), 400);
  }

  const token = await getPbToken();
  if (!token) return json(JSON.stringify({ error: 'PB auth failed' }), 500);

  const headers = { 'Content-Type': 'application/json', 'Authorization': token };

  try {
    switch (body.action) {
      /* ===== 設定管理 ===== */

      case 'get_config': {
        const config = await getConfigRecord(headers);
        return json(JSON.stringify({ ok: true, config }));
      }

      case 'set_config': {
        const config = await getConfigRecord(headers);
        const update: Record<string, any> = {};
        if (body.voting_open !== undefined) update.voting_open = body.voting_open;
        if (body.auction_open !== undefined) update.auction_open = body.auction_open;
        if (body.map_event !== undefined) update.map_event = body.map_event;
        if (body.ranking_visible !== undefined) update.ranking_visible = body.ranking_visible;

        const res = await fetch(`${PB_URL}/api/collections/event_config/records/${config.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(update),
        });
        const updated = await res.json();
        return json(JSON.stringify({ ok: true, config: updated }));
      }

      /* ===== オークション ===== */

      case 'seed_auction': {
        const created = [];
        for (const item of SAMPLE_AUCTION_ITEMS) {
          const res = await fetch(`${PB_URL}/api/collections/auction_items/records`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...item, current_price: item.start_price, status: 'upcoming', start_time: new Date().toISOString() }),
          });
          if (res.ok) created.push(await res.json());
        }
        return json(JSON.stringify({ ok: true, created: created.length }));
      }

      case 'update_auction_status': {
        if (!body.itemId || !body.status) return json(JSON.stringify({ error: 'itemId and status required' }), 400);
        const res = await fetch(`${PB_URL}/api/collections/auction_items/records/${body.itemId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: body.status }),
        });
        return json(JSON.stringify({ ok: res.ok }));
      }

      case 'update_auction_price': {
        if (!body.itemId || body.price === undefined) return json(JSON.stringify({ error: 'itemId and price required' }), 400);
        const res = await fetch(`${PB_URL}/api/collections/auction_items/records/${body.itemId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ current_price: Number(body.price) }),
        });
        return json(JSON.stringify({ ok: res.ok }));
      }

      case 'clear_auction': {
        const list = await fetch(`${PB_URL}/api/collections/auction_items/records?perPage=100`, { headers });
        const data = await list.json() as { items?: { id: string }[] };
        for (const item of data.items || []) {
          await fetch(`${PB_URL}/api/collections/auction_items/records/${item.id}`, { method: 'DELETE', headers });
        }
        const bids = await fetch(`${PB_URL}/api/collections/auction_bids/records?perPage=500`, { headers });
        const bidData = await bids.json() as { items?: { id: string }[] };
        for (const bid of bidData.items || []) {
          await fetch(`${PB_URL}/api/collections/auction_bids/records/${bid.id}`, { method: 'DELETE', headers });
        }
        return json(JSON.stringify({ ok: true }));
      }

      case 'list_auction': {
        const res = await fetch(`${PB_URL}/api/collections/auction_items/records?sort=-created&perPage=50`, { headers });
        const data = await res.json();
        return json(JSON.stringify(data));
      }

      /* ===== 投票 ===== */

      case 'clear_votes': {
        const list = await fetch(`${PB_URL}/api/collections/car_votes/records?perPage=500`, { headers });
        const data = await list.json() as { items?: { id: string }[] };
        for (const item of data.items || []) {
          await fetch(`${PB_URL}/api/collections/car_votes/records/${item.id}`, { method: 'DELETE', headers });
        }
        return json(JSON.stringify({ ok: true, deleted: (data.items || []).length }));
      }

      case 'vote_count': {
        const res = await fetch(`${PB_URL}/api/collections/car_votes/records?perPage=1`, { headers });
        const data = await res.json() as { totalItems?: number };
        return json(JSON.stringify({ ok: true, count: data.totalItems || 0 }));
      }

      case 'bid_count': {
        const res = await fetch(`${PB_URL}/api/collections/auction_bids/records?perPage=1`, { headers });
        const data = await res.json() as { totalItems?: number };
        return json(JSON.stringify({ ok: true, count: data.totalItems || 0 }));
      }

      /* ===== デモ開催 ===== */

      case 'demo_start': {
        // 全クリア
        const oldList = await fetch(`${PB_URL}/api/collections/auction_items/records?perPage=100`, { headers });
        const oldData = await oldList.json() as { items?: { id: string }[] };
        for (const item of oldData.items || []) {
          await fetch(`${PB_URL}/api/collections/auction_items/records/${item.id}`, { method: 'DELETE', headers });
        }
        const oldBids = await fetch(`${PB_URL}/api/collections/auction_bids/records?perPage=500`, { headers });
        const oldBidData = await oldBids.json() as { items?: { id: string }[] };
        for (const bid of oldBidData.items || []) {
          await fetch(`${PB_URL}/api/collections/auction_bids/records/${bid.id}`, { method: 'DELETE', headers });
        }
        const oldVotes = await fetch(`${PB_URL}/api/collections/car_votes/records?perPage=500`, { headers });
        const oldVoteData = await oldVotes.json() as { items?: { id: string }[] };
        for (const vote of oldVoteData.items || []) {
          await fetch(`${PB_URL}/api/collections/car_votes/records/${vote.id}`, { method: 'DELETE', headers });
        }
        // サンプル作成 (live)
        const demoCreated = [];
        for (const item of SAMPLE_AUCTION_ITEMS) {
          const res = await fetch(`${PB_URL}/api/collections/auction_items/records`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...item, current_price: item.start_price, status: 'live', start_time: new Date().toISOString() }),
          });
          if (res.ok) demoCreated.push(await res.json());
        }
        // 設定ON
        const config = await getConfigRecord(headers);
        await fetch(`${PB_URL}/api/collections/event_config/records/${config.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ voting_open: true, auction_open: true }),
        });
        return json(JSON.stringify({ ok: true, created: demoCreated.length, message: 'デモ開催中！' }));
      }

      /* ===== 全リセット ===== */

      case 'reset_all': {
        // オークション
        const items = await fetch(`${PB_URL}/api/collections/auction_items/records?perPage=100`, { headers });
        const itemData = await items.json() as { items?: { id: string }[] };
        for (const item of itemData.items || []) {
          await fetch(`${PB_URL}/api/collections/auction_items/records/${item.id}`, { method: 'DELETE', headers });
        }
        // 入札
        const bids = await fetch(`${PB_URL}/api/collections/auction_bids/records?perPage=500`, { headers });
        const bidData = await bids.json() as { items?: { id: string }[] };
        for (const bid of bidData.items || []) {
          await fetch(`${PB_URL}/api/collections/auction_bids/records/${bid.id}`, { method: 'DELETE', headers });
        }
        // 投票
        const votes = await fetch(`${PB_URL}/api/collections/car_votes/records?perPage=500`, { headers });
        const voteData = await votes.json() as { items?: { id: string }[] };
        for (const vote of voteData.items || []) {
          await fetch(`${PB_URL}/api/collections/car_votes/records/${vote.id}`, { method: 'DELETE', headers });
        }
        // 設定OFF
        const config = await getConfigRecord(headers);
        await fetch(`${PB_URL}/api/collections/event_config/records/${config.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ voting_open: false, auction_open: false }),
        });
        return json(JSON.stringify({ ok: true, message: '全リセット完了' }));
      }

      default:
        return json(JSON.stringify({ error: 'Unknown action' }), 400);
    }
  } catch (e: any) {
    return json(JSON.stringify({ error: e.message }), 500);
  }
};
