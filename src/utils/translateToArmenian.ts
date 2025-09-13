export interface TranslationResult {
  translatedText: string;
  success: boolean;
  error?: string;
}

/**
 * Translate English text to Armenian using Google Translate API via Netlify function
 */
export async function translateToArmenian(englishText: string): Promise<TranslationResult> {
  if (!englishText.trim()) {
    return {
      translatedText: '',
      success: false,
      error: 'No text provided'
    };
  }

  try {
    const response = await fetch('/.netlify/functions/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: englishText.trim(),
        source: 'en',
        target: 'hy'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Translation failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.translatedText) {
      return {
        translatedText: data.translatedText,
        success: true
      };
    } else {
      throw new Error(data.error || 'No translation returned');
    }
  } catch (error) {
    console.error('Translation API error:', error);
    return {
      translatedText: '',
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed'
    };
  }
}