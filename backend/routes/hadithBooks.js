const express = require('express');
const router = express.Router();
const pool = require('../db/client');

const VALID_STATUSES = ['unchecked', 'found', 'not_found', 'not_available'];

// GET /api/hadiths/:hadithId/books
// Returns all books with this hadith's status for each (joined)
router.get('/hadiths/:hadithId/books', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, hb.id AS hadith_book_id, hb.status, hb.matn_arabic
       FROM books b
       LEFT JOIN hadith_books hb
         ON hb.book_id = b.id AND hb.hadith_id = $1
       ORDER BY b.display_order ASC`,
      [req.params.hadithId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hadiths/:hadithId/books
// Set status for a book on this hadith (creates or updates)
router.post('/hadiths/:hadithId/books', async (req, res) => {
  const { book_id, status, matn_arabic } = req.body;
  if (!book_id) return res.status(400).json({ error: 'book_id is required' });
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  try {
    const result = await pool.query(
      `INSERT INTO hadith_books (hadith_id, book_id, status, matn_arabic)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (hadith_id, book_id)
       DO UPDATE SET status = $3, matn_arabic = $4, updated_at = NOW()
       RETURNING *`,
      [req.params.hadithId, book_id, status, matn_arabic || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/hadith-books/:id
// Update status or matn on an existing hadith_books record
router.patch('/hadith-books/:id', async (req, res) => {
  const { status, matn_arabic } = req.body;
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  try {
    const result = await pool.query(
      `UPDATE hadith_books
       SET status = COALESCE($1, status),
           matn_arabic = COALESCE($2, matn_arabic),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status || null, matn_arabic || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
