const express = require('express');
const router = express.Router();
const pool = require('../db/client');

// GET /api/hadith-books/:hadithBookId/chain
// Returns narrators in this chain ordered by position
router.get('/hadith-books/:hadithBookId/chain', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.position, n.*
       FROM chains c
       JOIN narrators n ON n.id = c.narrator_id
       WHERE c.hadith_book_id = $1
       ORDER BY c.position ASC`,
      [req.params.hadithBookId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hadith-books/:hadithBookId/chain
// Save a full ordered chain — replaces any existing chain for this hadith_book
// Body: { narrators: [{ narrator_id, position }] }
router.post('/hadith-books/:hadithBookId/chain', async (req, res) => {
  const { narrators } = req.body;
  if (!Array.isArray(narrators) || narrators.length === 0) {
    return res.status(400).json({ error: 'narrators array is required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Delete existing chain for this hadith_book
    await client.query('DELETE FROM chains WHERE hadith_book_id = $1', [req.params.hadithBookId]);
    // Insert new chain
    for (const { narrator_id, position } of narrators) {
      await client.query(
        'INSERT INTO chains (hadith_book_id, narrator_id, position) VALUES ($1, $2, $3)',
        [req.params.hadithBookId, narrator_id, position]
      );
    }
    await client.query('COMMIT');
    // Return the saved chain
    const result = await pool.query(
      `SELECT c.id, c.position, n.*
       FROM chains c
       JOIN narrators n ON n.id = c.narrator_id
       WHERE c.hadith_book_id = $1
       ORDER BY c.position ASC`,
      [req.params.hadithBookId]
    );
    res.status(201).json(result.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
