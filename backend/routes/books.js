const express = require('express');
const router = express.Router();
const pool = require('../db/client');

// GET /api/books
// Optional query params: ?tier=1 to filter by tier
router.get('/', async (req, res) => {
  try {
    const { tier } = req.query;
    let query = 'SELECT * FROM books';
    const params = [];
    if (tier) {
      query += ' WHERE tier = $1';
      params.push(tier);
    }
    query += ' ORDER BY display_order ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
