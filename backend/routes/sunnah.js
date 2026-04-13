const express = require('express');
const router = express.Router();

const SUNNAH_API = 'https://api.sunnah.com/v1';

// GET /api/sunnah/search?q=...
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return res.status(400).json({ error: 'q is required' });

  const key = process.env.SUNNAH_API_KEY;
  if (!key) return res.status(503).json({ error: 'SUNNAH_API_KEY not configured' });

  try {
    const response = await fetch(
      `${SUNNAH_API}/hadiths/random?limit=10`,  // sunnah.com search endpoint
      { headers: { 'X-API-Key': key } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach sunnah.com API' });
  }
});

// GET /api/sunnah/collections/:collection/hadiths/:number
router.get('/collections/:collection/hadiths/:number', async (req, res) => {
  const key = process.env.SUNNAH_API_KEY;
  if (!key) return res.status(503).json({ error: 'SUNNAH_API_KEY not configured' });

  try {
    const response = await fetch(
      `${SUNNAH_API}/collections/${req.params.collection}/hadiths/${req.params.number}`,
      { headers: { 'X-API-Key': key } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach sunnah.com API' });
  }
});

module.exports = router;
