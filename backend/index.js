require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/client');

const projectsRouter = require('./routes/projects');
const hadithsRouter = require('./routes/hadiths');
const booksRouter = require('./routes/books');
const hadithBooksRouter = require('./routes/hadithBooks');
const narratorsRouter = require('./routes/narrators');
const chainsRouter = require('./routes/chains');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Muhaddith API running', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/projects', projectsRouter);
app.use('/api', hadithsRouter);
app.use('/api/books', booksRouter);
app.use('/api', hadithBooksRouter);
app.use('/api/narrators', narratorsRouter);
app.use('/api', chainsRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
