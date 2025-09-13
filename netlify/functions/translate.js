// netlify/functions/translate.js
// Serverless proxy for Google Cloud Translation (v2) with CORS + preflight support

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",                  // we don't send cookies, so * is OK
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  // Simple health check
  if (event.queryStringParameters && event.queryStringParameters.ping) {
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: "Method Not Allowed",
    };
  }

  // Read API key from Netlify env vars
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Server is missing GOOGLE_TRANSLATE_API_KEY" }),
    };
  }

  // Parse request body
  let text = "";
  let source = "auto";
  let target = "hy";
  try {
    const body = JSON.parse(event.body || "{}");
    text = (body.text || "").toString();
    source = (body.source || "auto").toString();
    target = (body.target || "hy").toString();
  } catch (e) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!text.trim()) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing 'text' to translate" }),
    };
  }

  // Call Google Translate v2
  try {
    const payload = {
      q: text,
      target,
      format: "text",
      // If source === 'auto' omit it; letting Google auto-detect improves success rate
      ...(source && source !== "auto" ? { source } : {}),
    };

    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();

    if (!res.ok || json.error) {
      // Log details to Netlify logs to help debugging
      console.error("Google Translate error:", json);
      return {
        statusCode: res.status || 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error:
            json?.error?.message ||
            "Google Translate API returned an error",
        }),
      };
    }

    const translatedText =
      json?.data?.translations?.[0]?.translatedText || "";

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, translatedText }),
    };
  } catch (err) {
    console.error("Translate function failed:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Translation failed" }),
    };
  }
}
