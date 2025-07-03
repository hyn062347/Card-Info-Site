import { getStore } from "@netlify/blobs";
import { schedule } from "@netlify/functions";
// 매 시간 0·15·30·45분마다 실행 (UTC)
export const config = { schedule: "0,15,30,45 * * * *" };

export default schedule(async () => {
  const res = await fetch(
    "https://mtgjson.com/api/v5/AllPricesToday.json.gz"
  );
  const buffer = await res.arrayBuffer();
  const json = JSON.parse(await import("zlib").then(z =>
    z.gunzipSync(Buffer.from(buffer)).toString("utf8")
  ));
  const store = getStore("prices");
  console.log("Writing Blob: Prices", json.data);
  await store.set("allPricesToday", JSON.stringify(json.data));
});