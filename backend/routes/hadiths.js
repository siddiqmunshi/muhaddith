const express = require('express');
const router = express.Router();
const pool = require('../db/client');

// GET /api/projects/:projectId/hadiths
router.get('/projects/:projectId/hadiths', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hadiths WHERE project_id = $1 ORDER BY created_at DESC',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hadiths/:id
router.get('/hadiths/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hadiths WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hadith not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:projectId/hadiths
router.post('/projects/:projectId/hadiths', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Hadith name is required' });
  try {
    // verify project exists
    const project = await pool.query('SELECT id FROM projects WHERE id = $1', [req.params.projectId]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    const result = await pool.query(
      'INSERT INTO hadiths (project_id, name) VALUES ($1, $2) RETURNING *',
      [req.params.projectId, name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/hadiths/:id
router.patch('/hadiths/:id', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Hadith name is required' });
  try {
    const result = await pool.query(
      'UPDATE hadiths SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name.trim(), req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hadith not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hadiths/:id
router.delete('/hadiths/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM hadiths WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hadith not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
