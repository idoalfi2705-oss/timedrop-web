// Vercel serverless function — calculates real driving time
// Uses Nominatim (OpenStreetMap geocoding, free) + OSRM (free routing engine)
// No API keys required.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { addresses } = req.body || {};
  if (!Array.isArray(addresses) || addresses.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 addresses' });
  }

  try {
    // Geocode sequentially — Nominatim requires ≤1 req/sec
    const coords = [];
    for (const addr of addresses) {
      const c = await geocode(addr);
      if (c) coords.push(c);
      await sleep(250);
    }

    if (coords.length < 2) {
      return res.status(422).json({ error: 'Could not geocode enough addresses' });
    }

    // OSRM route (open-source routing, Israel covered by OSM data)
    const waypoints = coords.map(c => `${c.lon},${c.lat}`).join(';');
    const osrmRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=false&steps=false`,
      { headers: { 'User-Agent': 'TimeDrop/1.0' } }
    );
    const osrm = await osrmRes.json();

    if (!osrm.routes?.length) {
      return res.status(422).json({ error: 'OSRM returned no route' });
    }

    const seconds = osrm.routes[0].duration;
    const minutes = Math.round(seconds / 60);
    const km      = Math.round(osrm.routes[0].distance / 1000);

    return res.json({
      durationMinutes: minutes,
      durationText:    formatDuration(minutes),
      distanceKm:      km,
      waypointsUsed:   coords.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

async function geocode(address) {
  try {
    const q   = encodeURIComponent(address + ', ישראל');
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=il`;
    const r   = await fetch(url, { headers: { 'User-Agent': 'TimeDrop/1.0' } });
    const d   = await r.json();
    if (!d?.length) return null;
    return { lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) };
  } catch {
    return null;
  }
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} שעות ו-${m} דקות`;
  if (h > 0) return `${h} שעות`;
  return `${m} דקות`;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
