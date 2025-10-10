import { app } from "@azure/functions";

app.http("speech-token", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "speech-token",
  handler: async (req, context) => {
    try {
      const speechKey = process.env.SPEECH_KEY;
      const speechRegion = process.env.SPEECH_REGION;
      if (!speechKey || !speechRegion) {
        return { status: 500, jsonBody: { error: "키/리전 미설정" } };
      }

      const url = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Ocp-Apim-Subscription-Key": speechKey }
      });
      if (!resp.ok) {
        const text = await resp.text();
        context.log("Speech issueToken error:", resp.status, text);
        return { status: 502, jsonBody: { error: "토큰 발급 실패" } };
      }

      const token = await resp.text();
      return {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*"
        },
        jsonBody: { token, region: speechRegion }
      };
    } catch (e) {
      context.log.error(e);
      return { status: 500, jsonBody: { error: "Internal error" } };
    }
  }
});
