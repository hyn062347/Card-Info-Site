// File: netlify/functions/updateIdentifiersBackground.mjs
import { getStore } from "@netlify/blobs";
import zlib from "node:zlib";
import { promisify } from "node:util";
import fetch from "node-fetch";

const gunzip = promisify(zlib.gunzip);

// Background Function: on-demand, 최대 15분 실행
export const background = true;
export default async function updateIdentifiersBackground(request, context) {
  // ① 파일 다운로드 & 압축 해제
  const url = "https://mtgjson.com/api/v5/AllIdentifiers.json.gz";
  const gz = await fetch(url).then(r => r.arrayBuffer());
  const json = JSON.parse(
    (await gunzip(Buffer.from(gz))).toString("utf8")
  ).data;

  // ② (scryfallId → uuid) 매핑 생성
  const map = {};
  for (const [uuid, card] of Object.entries(json)) {
    const id = card.identifiers?.scryfallId;
    if (id) map[id.toLowerCase()] = uuid;
  }

  // ③ Blob 스토어에 저장
  const store = getStore("prices");
  console.log("[Background] Writing Blob: Identifiers");
  await store.set(
    "scry2uuid",
    JSON.stringify(map),
    { metadata: { updated: new Date().toISOString() } }
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "updateIdentifiersBackground completed" })
  };
}