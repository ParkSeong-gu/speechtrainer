// /api/token/index.js  (Functions v4, HTTP trigger)
import fetch from "node-fetch";

export default async (req, context) => {
  const speechKey = process.env.SPEECH_KEY;
  const speechRegion = process.env.SPEECH_REGION; // 예: koreacentral, eastasia 등
  if (!speechKey || !speechRegion) {
    return { status: 500, jsonBody: { error: '키/리전 미설정' } };
  }

  const url = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": speechKey }
  });

  if (!resp.ok) return { status: 500, jsonBody: { error: '토큰 발급 실패' } };
  const token = await resp.text();

  return { status: 200, jsonBody: { token, region: speechRegion } };
};
