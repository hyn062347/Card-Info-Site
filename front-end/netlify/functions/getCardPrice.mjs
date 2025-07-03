import { getStore } from "@netlify/blobs";

export default async (req) => {
    // 1) 쿼리 파라미터에서 Scryfall ID 수집
    const scry = new URL(req.url).searchParams.get("scry");
    if (!scry)
        return new Response(
            JSON.stringify({ error: "Missing scry param" }),
            { status: 400, headers: { "content-type": "application/json" } }
        );

    // 2) Blobs 스토어에서 매핑·가격 가져오기
    const store = getStore("prices");             // update-* 와 동일 스토어
    const mapJSON = await store.get("scry2uuid");
    const priceJSON = await store.get("pricesToday");
    if (!mapJSON || !priceJSON)
        return new Response(
            JSON.stringify({ error: "Blob not ready yet" }),
            { status: 503, headers: { "content-type": "application/json" } }
        );


    const scry2uuid = JSON.parse(mapJSON);
    const uuid = scry2uuid[scry.toLowerCase()];
    if (!uuid)
        return new Response(
            JSON.stringify({ error: "Unknown Scryfall ID" }),
            { status: 404, headers: { "content-type": "application/json" } }
        );

    const pricesToday = JSON.parse(priceJSON);
    const ck = pricesToday[uuid]?.paper?.cardkingdom?.retail;
    const latestDate = ck?.normal ? Object.keys(ck.normal).pop() : null;

    const body = {
        uuid,
        normal: latestDate ? ck.normal[latestDate] : null,
        foil: latestDate && ck.foil ? ck.foil[latestDate] : null,
    };

    return new Response(JSON.stringify(body), {
        headers: {
            "content-type": "application/json",
            // 브라우저 캐시 60 초 (선택)
            "cache-control": "public, max-age=60",
        },
    });
};