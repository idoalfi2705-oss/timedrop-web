// Vercel serverless function — proxies requests to Google Gemini API (free tier)
// Set GEMINI_API_KEY in Vercel Environment Variables

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const { messages, systemPrompt } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Gemini requires alternating user/model turns — ensure last message is from user
  const contents = messages
    .filter(m => m.content && m.content.trim())
    .map(m => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Prepend system prompt as first user message (most compatible approach)
  const allContents = systemPrompt
    ? [{ role: 'user', parts: [{ text: systemPrompt }] }, { role: 'model', parts: [{ text: 'הבנתי, אשמח לעזור.' }] }, ...contents]
    : contents;

  const body = {
    contents: allContents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || JSON.stringify(data.error) || 'Gemini API error';
      return res.status(response.status).json({ error: errMsg });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ content: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
