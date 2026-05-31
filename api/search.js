// Vercel serverless function — web search via Tavily AI Search API
// Free tier: 1,000 searches/month. Get key at tavily.com (no credit card needed)
// Set TAVILY_API_KEY in Vercel Environment Variables

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'TAVILY_API_KEY not configured' });

  const { query } = req.body || {};
  if (!query?.trim()) return res.status(400).json({ error: 'query is required' });

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:        apiKey,
        query:          query,
        search_depth:   'basic',
        max_results:    3,
        include_answer: true,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Tavily error' });
    }

    return res.json({
      answer:  data.answer || '',
      results: (data.results || []).map(r => ({
        title:   r.title,
        content: (r.content || '').slice(0, 400),
        url:     r.url,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
