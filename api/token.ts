// Vercel Edge Function for generating OpenAI ephemeral tokens
// This keeps the API key secure on the server side

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Request an ephemeral token from OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
          audio: {
            input: {
              format: 'pcm16',
              sample_rate: 24000
            },
            output: {
              voice: 'alloy',
              format: 'pcm16',
              sample_rate: 24000
            }
          }
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      
      return new Response(JSON.stringify({ 
        error: 'Failed to generate token',
        details: errorData.error?.message || 'Unknown error'
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()

    // Return the ephemeral token
    return new Response(JSON.stringify({
      token: data.value,
      expiresAt: Date.now() + (60 * 1000) // Token expires in 60 seconds
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Token generation error:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
