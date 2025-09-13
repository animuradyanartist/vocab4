const https = require('https');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userMessage, conversationHistory = [] } = JSON.parse(event.body);
    
    if (!userMessage || !userMessage.trim()) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Message is required' 
        })
      };
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'AI service not configured' 
        })
      };
    }

    // Prepare messages for Perplexity API
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant specializing in Armenian language learning. Help users with vocabulary, grammar, pronunciation, and practice conversations. Be encouraging and provide clear, practical advice.'
      },
      ...conversationHistory.slice(-4), // Last 4 messages for context
      {
        role: 'user',
        content: userMessage.trim()
      }
    ];

    const requestData = JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: false
    });

    const response = await new Promise((resolve, reject) => {
      const req = https.request('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      req.write(requestData);
      req.end();
    });

    if (response.statusCode !== 200) {
      throw new Error(`Perplexity API error: ${response.statusCode}`);
    }

    const aiMessage = response.data?.choices?.[0]?.message?.content;
    
    if (!aiMessage) {
      throw new Error('No response from AI');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: aiMessage.trim()
      })
    };

  } catch (error) {
    console.error('Perplexity API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'AI service temporarily unavailable'
      })
    };
  }
};