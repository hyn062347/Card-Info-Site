import { schedule } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import zlib from "node:zlib";
import { promisify } from "node:util";
import fetch from "node-fetch";

const gunzip = promisify(zlib.gunzip);

// 매 시간 0·15·30·45분마다 실행 (UTC)
export const config = { schedule: "0,15,30,45 * * * *" };

export default schedule(async () => {
  // ────── ② 파일 다운로드 & 압축 해제 ──────
  const url =
    "https://mtgjson.com/api/v5/AllIdentifiers.json.gz";
  const gz = await fetch(url).then(r => r.arrayBuffer());
  const json = JSON.parse(
    (await gunzip(Buffer.from(gz))).toString("utf8")
  ).data;

  // ────── ③ (scryfallId → uuid) 사전 생성 ──────
  const map = {};
  for (const [uuid, card] of Object.entries(json)) {
    const id = card.identifiers?.scryfallId;
    if (id) map[id.toLowerCase()] = uuid;
  }

  // ────── ④ Blobs 스토어에 저장 ──────
  const store = getStore("prices");            // 같은 스토어 재사용
  console.log("Writing a Blob: Identifiers", map)
  await store.set("scry2uuid", JSON.stringify(map), {
    metadata: { updated: new Date().toISOString() },
  });
});