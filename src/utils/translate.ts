import { supabase } from "../config/supabase"; // ✅ FIXED path

export interface TranslationResult {
  translatedText: string;
  success: boolean;
  error?: string;
}

/** Fallback if user has no profile row yet */
const FALLBACK_LANG = "hy"; // Armenian

/** Map our app codes to your translate function's expected codes */
const SUPPORTED_CODES = new Set(["hy", "ru", "it"] as const);
type Supported = "hy" | "ru" | "it";

/** Reads the user's chosen learning language from public.user_profiles.native_language_code */
async function getUserLanguageCode(): Promise<Supported> {
  // If no auth user, default to Armenian
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id || auth?.user?.uid; // supabase-js v2 returns .id
  if (!uid) return FALLBACK_LANG as Supported;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("native_language_code")
    .eq("id", uid) // your table uses auth UID as PK
    .single();

  if (error) {
    // console.warn("Could not load user language:", error);
    return FALLBACK_LANG as Supported;
  }

  const code = (data?.native_language_code || FALLBACK_LANG).toLowerCase();
  return (SUPPORTED_CODES.has(code as Supported) ? code : FALLBACK_LANG) as Supported;
}

/** Core call to your Netlify translate function */
async function callTranslateFunction(
  englishText: string,
  target: Supported
): Promise<TranslationResult> {
  if (!englishText.trim()) {
    return { translatedText: "", success: false, error: "No text provided" };
  }

  try {
    const response = await fetch("/.netlify/functions/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: englishText.trim(),
        source: "en",
        target, // "hy" | "ru" | "it"
      }),
    });

    if (!response.ok) {
      let errorMessage = `Translation failed: ${response.status}`;
      try {
        const err = await response.json();
        if (err?.error) errorMessage = err.error;
      } catch {}
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data?.success && data?.translatedText) {
      return { translatedText: data.translatedText, success: true };
    }
    throw new Error(data?.error || "No translation returned");
  } catch (error) {
    console.error("Translation API error:", error);
    return {
      translatedText: "",
      success: false,
      error: error instanceof Error ? error.message : "Translation failed",
    };
  }
}

/**
 * ✅ New: Translate EN → user's chosen language (hy/ru/it) from Supabase profile
 * Usage:
 *   const res = await translateFromEnglish("apple");
 *   if (res.success) console.log(res.translatedText);
 */
export async function translateFromEnglish(
  englishText: string
): Promise<TranslationResult> {
  const target = await getUserLanguageCode();
  return callTranslateFunction(englishText, target);
}

/**
 * Backwards compatible helper: EN → Armenian (kept so existing calls won’t break).
 * Prefer using translateFromEnglish() going forward.
 */
export async function translateToArmenian(
  englishText: string
): Promise<TranslationResult> {
  return callTranslateFunction(englishText, "hy");
}
