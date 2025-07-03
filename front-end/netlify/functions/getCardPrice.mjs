import { getStore } from "@netlify/blobs";

export default async (req, res) => {
  // 1) 쿼리 파라미터에서 Scryfall ID 수집
  const { scry } = req.query;
  if (!scry) return res.status(400).json({ error: "Missing scry param" });

  // 2) Blobs 스토어에서 매핑·가격 가져오기
  const store = getStore("prices");             // update-* 와 동일 스토어
  const mapJSON   = await store.get("scry2uuid");
  const priceJSON = await store.get("pricesToday");
  if (!mapJSON || !priceJSON)
    return res.status(503).json({ error: "Blob not ready yet" });

  const scry2uuid = JSON.parse(mapJSON);
  const uuid = scry2uuid[scry.toLowerCase()];
  if (!uuid) return res.status(404).json({ error: "Unknown Scryfall ID" });

  const pricesToday = JSON.parse(priceJSON);
  const ck = pricesToday[uuid]?.paper?.cardkingdom?.retail;
  const latestDate = ck?.normal ? Object.keys(ck.normal).pop() : null;

  return res.json({
    uuid,
    normal: latestDate ? ck.normal[latestDate] : null,
    foil:   latestDate && ck.foil   ? ck.foil[latestDate]   : null,
  });
};