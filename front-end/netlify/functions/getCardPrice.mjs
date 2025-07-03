// netlify/functions/getCardPrice.mjs
import { getStore } from "@netlify/blobs";
import zlib from "node:zlib";
import { promisify } from "node:util";

const gunzip = promisify(zlib.gunzip);
const PRICES_URL = "https://mtgjson.com/api/v5/AllPricesToday.json.gz";
const IDS_URL    = "https://mtgjson.com/api/v5/AllIdentifiers.json.gz";

/** Blob에 key가 없으면 srcURL을 다운로드해 저장 후 JSON.parse 결과 반환 */
async function ensureBlobJSON(key, srcURL, transform = d => d) {
  const store = getStore("prices");
  let txt = await store.get(key);
  if (!txt) {
    // ① 다운로드 + gunzip
    const gz  = await fetch(srcURL, { redirect: "follow", timeout: 60_000 })
                       .then(r => r.arrayBuffer());
    const raw = await gunzip(Buffer.from(gz));
    const data = transform(JSON.parse(raw).data);
    txt = JSON.stringify(data);
    // ② Blob에 쓴다 (첫 호출만)
    await store.set(key, txt, { metadata: { updated: Date.now() } });
  }
  return JSON.parse(txt);
}

export default async (req) => {
  const scry = new URL(req.url).searchParams.get("scry");
  if (!scry) return new Response("Missing ?scry=", { status: 400 });

  /* ─── Lazy warm 단계 ─────────────────────────────────────── */
  // ⓐ Scryfall ↔ UUID 매핑 확보
  const scry2uuid = await ensureBlobJSON(
    "scry2uuid",
    IDS_URL,
    data => Object.fromEntries(
      Object.entries(data).map(([uuid, c]) =>
        [c.identifiers?.scryfallId?.toLowerCase(), uuid])
    )
  );
  // ⓑ 가격 데이터 확보
  const prices = await ensureBlobJSON("pricesToday", PRICES_URL);
  /* ────────────────────────────────────────────────────────── */

  const uuid = scry2uuid[scry.toLowerCase()];
  if (!uuid) return new Response("Unknown Scryfall ID", { status: 404 });

  const ck   = prices[uuid]?.paper?.cardkingdom?.retail;
  const d    = ck?.normal && Object.keys(ck.normal).pop();
  const body = { uuid, normal: d ? ck.normal[d] : null, foil: d && ck.foil ? ck.foil[d] : null };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      // 1 분 브라우저 캐시
      "cache-control": "public, max-age=60"
    }
  });
};