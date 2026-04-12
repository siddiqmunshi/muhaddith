-- Muhaddith Database Schema

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hadiths (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pre-populated canonical book list
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  name_arabic VARCHAR(255) NOT NULL,
  name_english VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  short_code VARCHAR(50) UNIQUE NOT NULL,
  display_order INTEGER
);

-- Per-hadith result for each book
-- status values:
--   unchecked     — book has not been consulted yet (default)
--   found         — book was checked and the hadith was found
--   not_found     — book was checked and the hadith was not found
--   not_available — book could not be consulted (no access to this source)
CREATE TABLE IF NOT EXISTS hadith_books (
  id SERIAL PRIMARY KEY,
  hadith_id INTEGER REFERENCES hadiths(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id),
  status VARCHAR(20) DEFAULT 'unchecked'
    CHECK (status IN ('unchecked', 'found', 'not_found', 'not_available')),
  matn_arabic TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hadith_id, book_id)
);

-- Narrators master list (shared across all hadiths)
CREATE TABLE IF NOT EXISTS narrators (
  id SERIAL PRIMARY KEY,
  name_arabic VARCHAR(255) NOT NULL,
  name_transliteration VARCHAR(255),
  birth_year INTEGER,
  death_year INTEGER,
  location VARCHAR(255),
  grade VARCHAR(100),       -- e.g. ثقة، ضعيف، مجهول
  grade_notes TEXT,
  is_companion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chain of narrators per hadith-book combination
CREATE TABLE IF NOT EXISTS chains (
  id SERIAL PRIMARY KEY,
  hadith_book_id INTEGER REFERENCES hadith_books(id) ON DELETE CASCADE,
  narrator_id INTEGER REFERENCES narrators(id),
  position INTEGER NOT NULL,   -- order in the chain (0 = Prophet/source, last = collector)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed canonical books
INSERT INTO books (name_arabic, name_english, author, short_code, display_order) VALUES
  ('صحيح البخاري', 'Sahih al-Bukhari', 'Muhammad ibn Ismail al-Bukhari', 'bukhari', 1),
  ('صحيح مسلم', 'Sahih Muslim', 'Muslim ibn al-Hajjaj', 'muslim', 2),
  ('سنن أبي داود', 'Sunan Abi Dawud', 'Abu Dawud al-Sijistani', 'abudawud', 3),
  ('جامع الترمذي', 'Jami al-Tirmidhi', 'Muhammad ibn Isa al-Tirmidhi', 'tirmidhi', 4),
  ('سنن النسائي', 'Sunan al-Nasa''i', 'Ahmad ibn Shu''ayb al-Nasa''i', 'nasai', 5),
  ('سنن ابن ماجه', 'Sunan Ibn Majah', 'Muhammad ibn Yazid Ibn Majah', 'ibnmajah', 6),
  ('موطأ مالك', 'Muwatta Malik', 'Malik ibn Anas', 'muwatta', 7),
  ('مسند أحمد', 'Musnad Ahmad', 'Ahmad ibn Hanbal', 'musnad', 8),
  ('سنن الدارمي', 'Sunan al-Darimi', 'Abdullah ibn Abd al-Rahman al-Darimi', 'darimi', 9),
  ('سنن البيهقي', 'Sunan al-Bayhaqi', 'Ahmad ibn al-Husayn al-Bayhaqi', 'bayhaqi', 10)
ON CONFLICT (short_code) DO NOTHING;
