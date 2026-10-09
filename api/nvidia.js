// Vercel Edge Function to proxy NVIDIA API calls
// This avoids CORS issues in production

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

  if (!NVIDIA_API_KEY) {
    return new Response(JSON.stringify({ error: 'NVIDIA_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get the path after /api/nvidia/
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/nvidia', '');
    const search = url.search;

    // Forward the request to NVIDIA
    const nvidiaResponse = await fetch(`${NVIDIA_BASE_URL}${path}${search}`, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    // Return the response
    const data = await nvidiaResponse.text();
    return new Response(data, {
      status: nvidiaResponse.status,
      headers: {
        'Content-Type': nvidiaResponse.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}