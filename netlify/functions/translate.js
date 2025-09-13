// netlify/functions/translate.js
// Exact Google Translate via server (no client fallbacks)

export async function handler(event) {
  // CORS (lets Bolt preview call your Netlify function)
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({
        error:
          "GOOGLE_TRANSLATE_API_KEY is missing in Netlify environment variables.",
      }),
    };
  }

  try {
    const { text, source = "auto", target = "hy" } = JSON.parse(
      event.body || "{}"
    );

    if (!text || !target) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ error: "`text` and `target` are required." }),
      };
    }

    // Google Translate v2 REST
    const url =
      "https://translation.googleapis.com/language/translate/v2?key=" + apiKey;

    const gRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // model:"nmt" is accepted by v2 and uses Neural MT where available
      body: JSON.stringify({
        q: text,
        source, // "auto" is fine
        target, // "hy" for Armenian
        format: "text",
        model: "nmt",
      }),
    });

    const json = await gRes.json();
    if (!gRes.ok) {
      return {
        statusCode: gRes.status,
        headers: cors,
        body: JSON.stringify({
          error: json?.error?.message || "Google API error",
        }),
      };
    }

    const translatedText =
      json?.data?.translations?.[0]?.translatedText ?? "";

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        translatedText,
        detected: json?.data?.translations?.[0]?.detectedSourceLanguage,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: String(e?.message || e) }),
    };
  }
}
