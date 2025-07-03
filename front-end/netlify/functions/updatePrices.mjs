import { getStore } from "@netlify/blobs";
import { schedule } from "@netlify/functions";
export const config = { schedule: "@daily" };   // 매일 00:00 UTC

export default schedule(async () => {
  const res = await fetch(
    "https://mtgjson.com/api/v5/AllPricesToday.json.gz"
  );
  const buffer = await res.arrayBuffer();
  const json = JSON.parse(await import("zlib").then(z =>
    z.gunzipSync(Buffer.from(buffer)).toString("utf8")
  ));
  const store = getStore("prices");
  await store.set("allPricesToday", JSON.stringify(json));
});