// netlify/functions/getCardPrice.js
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.NETLIFY_DATABASE_URL });

export default async function handler(request /*, context */) {
  // ?scry=<id>
  const { searchParams } = new URL(request.url);
  const scry = searchParams.get("scry");

  if (!scry) {
    return new Response(JSON.stringify({ error: "missing scry param" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { rows } = await pool.query(
      "SELECT normal, foil FROM card_prices WHERE scryfall_id = $1",
      [scry]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ normal: null, foil: null }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "db error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}