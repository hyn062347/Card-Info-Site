import { schedule } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import zlib from "node:zlib";
import { promisify } from "node:util";
import fetch from "node-fetch";

const gunzip = promisify(zlib.gunzip);
const SERVERLESS_FNC_URL = '/.netlify/functions';
// 매 시간 0·15·30·45분마다 실행 (UTC)
export const config = { schedule: "*/10 * * * *" };

export default async function triggerUpdateIdentifiersWeekly(request, context) {
  // fire-and-forget HTTP 호출로 Background Function 실행
  const url = `${SERVERLESS_FNC_URL}/updateIdBack`;
  fetch(url, { method: "POST" })
    .then(() => console.log("Triggered updateIdentifiersBackground"))
    .catch(err => console.error("Trigger failed", err));

  // Scheduled 함수는 즉시 완료
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "triggerUpdateIdentifiersWeekly fired" })
  };
}