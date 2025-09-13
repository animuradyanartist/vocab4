export interface PerplexityResponse {
  message: string;
  success: boolean;
  error?: string;
}

/**
 * Send a message to Perplexity AI and get a response
 */
export async function sendToPerplexity(userMessage: string, conversationHistory?: Array<{role: string, content: string}>): Promise<PerplexityResponse> {
  if (!userMessage.trim()) {
    return {
      message: '',
      success: false,
      error: 'No message provided'
    };
  }

  try {
    const startTime = performance.now();

    const response = await fetch("/.netlify/functions/perplexity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory
      }),
    });

    if (response.status === 429) {
      return {
        message: '',
        success: false,
        error: 'Rate limit hit. Please wait a few seconds and try again.'
      };
    }

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: '',
        success: false,
        error: errorData.error || 'API request failed'
      };
    }

    const data = await response.json();

    const endTime = performance.now();
    console.log("⏱️ Perplexity Response Time:", (endTime - startTime).toFixed(0), "ms");

    return {
      message: data.message,
      success: data.success
    };
  } catch (error) {
    console.error('Perplexity API error:', error);
    return {
      message: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}