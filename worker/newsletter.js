export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://mundiopus.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const { email, updateEnabled } = body;
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({ email, updateEnabled: updateEnabled ?? true }),
    });

    const data = await brevoRes.json().catch(() => ({}));

    return new Response(JSON.stringify(data), {
      status: brevoRes.status,
      headers: corsHeaders(),
    });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://mundiopus.com',
    'Content-Type': 'application/json',
  };
}
