import { getStore } from "@netlify/blobs";
import { gunzipSync } from "node:zlib";
// 매 시간 0·15·30·45분마다 실행 (UTC)
export const config = { schedule: "*/5 * * * *" };

// export default schedule(async () => {
//   const res = await fetch(
//     "https://mtgjson.com/api/v5/AllPricesToday.json.gz"
//   );
//   const buffer = await res.arrayBuffer();
//   const json = JSON.parse(await import("zlib").then(z =>
//     z.gunzipSync(Buffer.from(buffer)).toString("utf8")
//   ));
//   const store = getStore("prices");
//   console.log("Writing Blob: Prices", json.data);
//   await store.set("allPricesToday", JSON.stringify(json.data));
// });

export default async function updatePrices(request, context) {
  // (next_run 는 request.json()으로 받을 수 있지만, 여기선 무시해도 됩니다)
  const res = await fetch("https://mtgjson.com/api/v5/AllPricesToday.json.gz");
  const buffer = await res.arrayBuffer();
  const json = JSON.parse(
    gunzipSync(Buffer.from(buffer)).toString("utf8")
  );
  const store = getStore("prices");
  console.log("Writing Blob: Prices", json.data);
  await store.set("allPricesToday", JSON.stringify(json.data));
  // scheduled 함수는 응답을 반드시 반환할 필요가 없습니다
}