// 2) netlify/functions/getCardPrice.js
import { Pool, neonConfig } from '@neondatabase/serverless';
// Node 20 이하인 Netlify 런타임은 TCP 대신 WebSocket 연결이 필요합니다
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.NETLIFY_DATABASE_URL });

// Netlify Functions 2.x 형식
export default async (req, res) => {
  // ?scry=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // Parse ?scry=<id> from the request URL (Netlify Functions 2.x request has no `query` field)
  const url = new URL(req.url, `http://${req.headers.host}`);
  const scry = url.searchParams.get('scry');
  if (!scry) return res.status(400).json({ error: 'missing scry param' });

  try {
    const { rows } = await pool.query(
      'SELECT normal, foil FROM card_prices WHERE scryfall_id = $1',
      [scry]
    );

    // 미등록 카드인 경우
    if (rows.length === 0) {
      return res.status(404).json({ normal: null, foil: null });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'db error' });
  }
};