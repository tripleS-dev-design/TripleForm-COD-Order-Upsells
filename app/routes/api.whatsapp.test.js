export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');
    
    console.log(`[WhatsApp Status] Route hit for shop: ${shop}`);
    
    // Pour l'instant, retournez une réponse simple
    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'WhatsApp status endpoint is working',
        shop: shop || 'not_provided',
        timestamp: new Date().toISOString(),
        note: 'WhatsApp integration is being set up'
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('[WhatsApp Status] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}