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
  author_arabic VARCHAR(255),
  author_english VARCHAR(255),
  author_death_ah INTEGER,         -- Hijri death year of the author
  collection_type VARCHAR(50),     -- e.g. صحيح، سنن، مسند، مصنف، معجم، جامع، موطأ
  tier INTEGER,                    -- 1 = Kutub al-Sittah, 2 = Major early, 3 = Sahihs & mu'jams, 4 = Later reference works
  short_code VARCHAR(50) UNIQUE NOT NULL,
  display_order INTEGER
);

-- Per-hadith result for each book (found or not)
CREATE TABLE IF NOT EXISTS hadith_books (
  id SERIAL PRIMARY KEY,
  hadith_id INTEGER REFERENCES hadiths(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id),
  found BOOLEAN DEFAULT FALSE,
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
  birth_year INTEGER,              -- Hijri
  death_year INTEGER,              -- Hijri
  location VARCHAR(255),
  grade VARCHAR(100),              -- e.g. ثقة، حسن، ضعيف، مجهول، متروك
  grade_notes TEXT,
  is_companion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chain of narrators per hadith-book combination
CREATE TABLE IF NOT EXISTS chains (
  id SERIAL PRIMARY KEY,
  hadith_book_id INTEGER REFERENCES hadith_books(id) ON DELETE CASCADE,
  narrator_id INTEGER REFERENCES narrators(id),
  position INTEGER NOT NULL,       -- order in the chain (0 = Prophet/source, last = collector)
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- SEED: Canonical and academic hadith book list
-- =============================================================================
-- Tier 1: Kutub al-Sittah (The Six Books) — the most canonical collections
-- Tier 2: Major early primary collections (1st–3rd century AH)
-- Tier 3: Sahihs, Musnads, and Mu'jams (3rd–5th century AH)
-- Tier 4: Later reference and compilation works (5th century AH onwards)
-- =============================================================================

INSERT INTO books (name_arabic, name_english, author_arabic, author_english, author_death_ah, collection_type, tier, short_code, display_order) VALUES

  -- -------------------------------------------------------------------------
  -- TIER 1: Kutub al-Sittah
  -- -------------------------------------------------------------------------
  ('صحيح البخاري',
   'Sahih al-Bukhari',
   'محمد بن إسماعيل البخاري',
   'Muhammad ibn Ismail al-Bukhari',
   256, 'صحيح', 1, 'bukhari', 10),

  ('صحيح مسلم',
   'Sahih Muslim',
   'مسلم بن الحجاج النيسابوري',
   'Muslim ibn al-Hajjaj al-Naysaburi',
   261, 'صحيح', 1, 'muslim', 20),

  ('سنن أبي داود',
   'Sunan Abi Dawud',
   'أبو داود سليمان بن الأشعث السجستاني',
   'Abu Dawud Sulayman ibn al-Ash''ath al-Sijistani',
   275, 'سنن', 1, 'abudawud', 30),

  ('الجامع الكبير (سنن الترمذي)',
   'Jami'' al-Tirmidhi (Sunan al-Tirmidhi)',
   'محمد بن عيسى الترمذي',
   'Muhammad ibn Isa al-Tirmidhi',
   279, 'جامع', 1, 'tirmidhi', 40),

  ('السنن الصغرى للنسائي (المجتبى)',
   'Sunan al-Nasa''i (al-Mujtaba)',
   'أحمد بن شعيب النسائي',
   'Ahmad ibn Shu''ayb al-Nasa''i',
   303, 'سنن', 1, 'nasai', 50),

  ('سنن ابن ماجه',
   'Sunan Ibn Majah',
   'محمد بن يزيد ابن ماجه القزويني',
   'Muhammad ibn Yazid Ibn Majah al-Qazwini',
   273, 'سنن', 1, 'ibnmajah', 60),

  -- -------------------------------------------------------------------------
  -- TIER 2: Major early primary collections
  -- -------------------------------------------------------------------------
  ('موطأ مالك',
   'Muwatta Malik',
   'مالك بن أنس الأصبحي',
   'Malik ibn Anas al-Asbahi',
   179, 'موطأ', 2, 'muwatta', 70),

  ('مسند الإمام أحمد',
   'Musnad al-Imam Ahmad',
   'أحمد بن محمد بن حنبل الشيباني',
   'Ahmad ibn Muhammad ibn Hanbal al-Shaybani',
   241, 'مسند', 2, 'musnad_ahmad', 80),

  ('سنن الدارمي (المسند الجامع)',
   'Sunan al-Darimi',
   'عبد الله بن عبد الرحمن الدارمي',
   'Abdullah ibn Abd al-Rahman al-Darimi',
   255, 'سنن', 2, 'darimi', 90),

  ('المصنف لعبد الرزاق',
   'Musannaf Abd al-Razzaq',
   'عبد الرزاق بن همام الصنعاني',
   'Abd al-Razzaq ibn Hammam al-San''ani',
   211, 'مصنف', 2, 'musannaf_abdrazzaq', 100),

  ('المصنف لابن أبي شيبة',
   'Musannaf Ibn Abi Shaybah',
   'أبو بكر عبد الله بن محمد ابن أبي شيبة',
   'Abu Bakr Abdullah ibn Muhammad Ibn Abi Shaybah',
   235, 'مصنف', 2, 'musannaf_ibnabishaybah', 110),

  ('مسند أبي داود الطيالسي',
   'Musnad Abi Dawud al-Tayalisi',
   'أبو داود سليمان بن داود الطيالسي',
   'Abu Dawud Sulayman ibn Dawud al-Tayalisi',
   204, 'مسند', 2, 'musnad_tayalisi', 120),

  ('مسند الشافعي',
   'Musnad al-Shafi''i',
   'محمد بن إدريس الشافعي',
   'Muhammad ibn Idris al-Shafi''i',
   204, 'مسند', 2, 'musnad_shafii', 130),

  ('مسند الحميدي',
   'Musnad al-Humaidi',
   'عبد الله بن الزبير الحميدي',
   'Abdullah ibn al-Zubayr al-Humaidi',
   219, 'مسند', 2, 'musnad_humaidi', 140),

  ('جامع معمر بن راشد',
   'Jami'' Ma''mar ibn Rashid',
   'معمر بن راشد الأزدي',
   'Ma''mar ibn Rashid al-Azdi',
   153, 'جامع', 2, 'jami_maamar', 150),

  ('كتاب الآثار لمحمد بن الحسن الشيباني',
   'Kitab al-Athar — Muhammad al-Shaybani',
   'محمد بن الحسن الشيباني',
   'Muhammad ibn al-Hasan al-Shaybani',
   189, 'آثار', 2, 'athar_shaybani', 160),

  ('كتاب الآثار لأبي يوسف',
   'Kitab al-Athar — Abu Yusuf',
   'يعقوب بن إبراهيم أبو يوسف',
   'Ya''qub ibn Ibrahim Abu Yusuf',
   182, 'آثار', 2, 'athar_abuyusuf', 170),

  ('سنن سعيد بن منصور',
   'Sunan Sa''id ibn Mansur',
   'سعيد بن منصور الخراساني',
   'Sa''id ibn Mansur al-Khurasani',
   227, 'سنن', 2, 'sunan_saidibnmansur', 180),

  ('مسند إسحاق بن راهويه',
   'Musnad Ishaq ibn Rahawayh',
   'إسحاق بن إبراهيم ابن راهويه',
   'Ishaq ibn Ibrahim Ibn Rahawayh',
   238, 'مسند', 2, 'musnad_ishaq', 190),

  ('مسند عبد بن حميد',
   'Musnad Abd ibn Humayd',
   'عبد بن حميد الكسي',
   'Abd ibn Humayd al-Kassi',
   249, 'مسند', 2, 'musnad_abdibnhumayd', 200),

  -- -------------------------------------------------------------------------
  -- TIER 3: Sahihs, Musnads, and Mu'jams (3rd–5th century AH)
  -- -------------------------------------------------------------------------
  ('صحيح ابن خزيمة',
   'Sahih Ibn Khuzaymah',
   'محمد بن إسحاق ابن خزيمة',
   'Muhammad ibn Ishaq Ibn Khuzaymah',
   311, 'صحيح', 3, 'sahih_ibnkhuzaymah', 210),

  ('صحيح ابن حبان',
   'Sahih Ibn Hibban',
   'محمد بن حبان البستي',
   'Muhammad ibn Hibban al-Busti',
   354, 'صحيح', 3, 'sahih_ibnhibban', 220),

  ('المستدرك على الصحيحين للحاكم',
   'Mustadrak al-Hakim',
   'أبو عبد الله محمد بن عبد الله الحاكم النيسابوري',
   'Abu Abdullah Muhammad ibn Abdullah al-Hakim al-Naysaburi',
   405, 'مستدرك', 3, 'mustadrak_hakim', 230),

  ('سنن الدارقطني',
   'Sunan al-Daraqutni',
   'علي بن عمر الدارقطني',
   'Ali ibn Umar al-Daraqutni',
   385, 'سنن', 3, 'sunan_daraqutni', 240),

  ('السنن الكبرى للبيهقي',
   'al-Sunan al-Kubra — al-Bayhaqi',
   'أحمد بن الحسين البيهقي',
   'Ahmad ibn al-Husayn al-Bayhaqi',
   458, 'سنن', 3, 'sunan_kubra_bayhaqi', 250),

  ('السنن الكبرى للنسائي',
   'al-Sunan al-Kubra — al-Nasa''i',
   'أحمد بن شعيب النسائي',
   'Ahmad ibn Shu''ayb al-Nasa''i',
   303, 'سنن', 3, 'sunan_kubra_nasai', 260),

  ('شعب الإيمان للبيهقي',
   'Shu''ab al-Iman — al-Bayhaqi',
   'أحمد بن الحسين البيهقي',
   'Ahmad ibn al-Husayn al-Bayhaqi',
   458, 'مسند', 3, 'shuab_iman_bayhaqi', 270),

  ('مسند البزار (البحر الزخار)',
   'Musnad al-Bazzar (al-Bahr al-Zakhkhar)',
   'أبو بكر أحمد بن عمرو البزار',
   'Abu Bakr Ahmad ibn Amr al-Bazzar',
   292, 'مسند', 3, 'musnad_bazzar', 280),

  ('مسند أبي يعلى الموصلي',
   'Musnad Abi Ya''la al-Mawsili',
   'أحمد بن علي بن المثنى أبو يعلى الموصلي',
   'Ahmad ibn Ali ibn al-Muthanna Abu Ya''la al-Mawsili',
   307, 'مسند', 3, 'musnad_abuyaala', 290),

  ('المعجم الكبير للطبراني',
   'al-Mu''jam al-Kabir — al-Tabarani',
   'سليمان بن أحمد الطبراني',
   'Sulayman ibn Ahmad al-Tabarani',
   360, 'معجم', 3, 'mujam_kabir_tabarani', 300),

  ('المعجم الأوسط للطبراني',
   'al-Mu''jam al-Awsat — al-Tabarani',
   'سليمان بن أحمد الطبراني',
   'Sulayman ibn Ahmad al-Tabarani',
   360, 'معجم', 3, 'mujam_awsat_tabarani', 310),

  ('المعجم الصغير للطبراني',
   'al-Mu''jam al-Saghir — al-Tabarani',
   'سليمان بن أحمد الطبراني',
   'Sulayman ibn Ahmad al-Tabarani',
   360, 'معجم', 3, 'mujam_saghir_tabarani', 320),

  ('الأدب المفرد للبخاري',
   'al-Adab al-Mufrad — al-Bukhari',
   'محمد بن إسماعيل البخاري',
   'Muhammad ibn Ismail al-Bukhari',
   256, 'أدب', 3, 'adab_mufrad', 330),

  ('مسند الروياني',
   'Musnad al-Ruyani',
   'أبو بكر محمد بن هارون الرويانى',
   'Abu Bakr Muhammad ibn Harun al-Ruyani',
   307, 'مسند', 3, 'musnad_ruyani', 340),

  ('معرفة السنن والآثار للبيهقي',
   'Ma''rifa al-Sunan wa al-Athar — al-Bayhaqi',
   'أحمد بن الحسين البيهقي',
   'Ahmad ibn al-Husayn al-Bayhaqi',
   458, 'مسند', 3, 'marifa_sunan_bayhaqi', 350),

  ('مسند الشاشي',
   'Musnad al-Shashi',
   'أبو سعيد الهيثم بن كليب الشاشي',
   'Abu Sa''id al-Haythm ibn Kulayb al-Shashi',
   335, 'مسند', 3, 'musnad_shashi', 360),

  ('مسند الطيالسي الكبير (فوائد العراقيين)',
   'Mu''jam al-Sahaba — Ibn Qani''',
   'عبد الباقي بن قانع',
   'Abd al-Baqi ibn Qani''',
   351, 'معجم', 3, 'mujam_sahaba_ibnqani', 370),

  -- -------------------------------------------------------------------------
  -- TIER 4: Later reference and compilation works
  -- -------------------------------------------------------------------------
  ('مجمع الزوائد ومنبع الفوائد',
   'Majma'' al-Zawa''id — al-Haythami',
   'نور الدين علي بن أبي بكر الهيثمي',
   'Nur al-Din Ali ibn Abi Bakr al-Haythami',
   807, 'جمع', 4, 'majma_zawaid', 380),

  ('كنز العمال في سنن الأقوال والأفعال',
   'Kanz al-''Ummal — al-Muttaqi al-Hindi',
   'علاء الدين علي المتقي بن حسام الهندي',
   'Ala al-Din Ali al-Muttaqi ibn Husam al-Hindi',
   975, 'جمع', 4, 'kanz_ummal', 390),

  ('الجامع الصغير للسيوطي',
   'al-Jami'' al-Saghir — al-Suyuti',
   'جلال الدين عبد الرحمن السيوطي',
   'Jalal al-Din Abd al-Rahman al-Suyuti',
   911, 'جامع', 4, 'jami_saghir_suyuti', 400),

  ('الدر المنثور في التفسير بالمأثور',
   'al-Durr al-Manthur — al-Suyuti',
   'جلال الدين عبد الرحمن السيوطي',
   'Jalal al-Din Abd al-Rahman al-Suyuti',
   911, 'تفسير', 4, 'durr_manthur_suyuti', 410),

  ('حلية الأولياء وطبقات الأصفياء',
   'Hilyat al-Awliya'' — Abu Nu''aym al-Isbahani',
   'أبو نعيم أحمد بن عبد الله الأصبهاني',
   'Abu Nu''aym Ahmad ibn Abdullah al-Isbahani',
   430, 'تراجم', 4, 'hilya_awliya', 420),

  ('تاريخ بغداد',
   'Tarikh Baghdad — al-Khatib al-Baghdadi',
   'أبو بكر أحمد بن علي الخطيب البغدادي',
   'Abu Bakr Ahmad ibn Ali al-Khatib al-Baghdadi',
   463, 'تاريخ', 4, 'tarikh_baghdad', 430),

  ('تاريخ دمشق',
   'Tarikh Dimashq — Ibn Asakir',
   'أبو القاسم علي بن الحسن ابن عساكر',
   'Abu al-Qasim Ali ibn al-Hasan Ibn Asakir',
   571, 'تاريخ', 4, 'tarikh_dimashq', 440),

  ('المطالب العالية بزوائد المسانيد الثمانية',
   'al-Matalib al-''Aliya — Ibn Hajar al-Asqalani',
   'أحمد بن علي بن حجر العسقلاني',
   'Ahmad ibn Ali Ibn Hajar al-Asqalani',
   852, 'جمع', 4, 'matalib_aliya', 450),

  ('إتحاف الخيرة المهرة بزوائد المسانيد العشرة',
   'Ithaf al-Khiyara al-Mahara — al-Busiri',
   'أحمد بن أبي بكر بن إسماعيل البوصيري',
   'Ahmad ibn Abi Bakr al-Busiri',
   840, 'جمع', 4, 'ithaf_khiyara', 460)

ON CONFLICT (short_code) DO NOTHING;
