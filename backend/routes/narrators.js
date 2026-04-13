const express = require('express');
const router = express.Router();
const pool = require('../db/client');

const VALID_GRADES = ['ثقة', 'حسن', 'صدوق', 'ضعيف', 'مجهول', 'متروك', 'كذاب', 'مختلف فيه'];

// GET /api/narrators?search=
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM narrators';
    const params = [];
    if (search?.trim()) {
      query += ' WHERE name_arabic ILIKE $1 OR name_transliteration ILIKE $1';
      params.push(`%${search.trim()}%`);
    }
    query += ' ORDER BY name_arabic ASC LIMIT 50';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/narrators/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM narrators WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Narrator not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/narrators
router.post('/', async (req, res) => {
  const { name_arabic, name_transliteration, birth_year, death_year, location, grade, grade_notes, is_companion } = req.body;
  if (!name_arabic?.trim()) return res.status(400).json({ error: 'name_arabic is required' });
  try {
    const result = await pool.query(
      `INSERT INTO narrators
        (name_arabic, name_transliteration, birth_year, death_year, location, grade, grade_notes, is_companion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name_arabic.trim(),
        name_transliteration?.trim() || null,
        birth_year || null,
        death_year || null,
        location?.trim() || null,
        grade || null,
        grade_notes?.trim() || null,
        is_companion || false,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/narrators/:id
router.patch('/:id', async (req, res) => {
  const { name_arabic, name_transliteration, birth_year, death_year, location, grade, grade_notes, is_companion } = req.body;
  try {
    const result = await pool.query(
      `UPDATE narrators SET
        name_arabic = COALESCE($1, name_arabic),
        name_transliteration = COALESCE($2, name_transliteration),
        birth_year = COALESCE($3, birth_year),
        death_year = COALESCE($4, death_year),
        location = COALESCE($5, location),
        grade = COALESCE($6, grade),
        grade_notes = COALESCE($7, grade_notes),
        is_companion = COALESCE($8, is_companion)
       WHERE id = $9
       RETURNING *`,
      [
        name_arabic?.trim() || null,
        name_transliteration?.trim() || null,
        birth_year || null,
        death_year || null,
        location?.trim() || null,
        grade || null,
        grade_notes?.trim() || null,
        is_companion ?? null,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Narrator not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
