import { useState, useEffect } from 'react'
import NarratorMetaPanel from './NarratorMetaPanel'
import { stripDiacritics } from '../../utils/arabic'

// Optional-diacritic pattern: matches zero or more harakat characters
const D = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u0640]*'

// Make each character in an Arabic word optionally followed by diacritics,
// so the pattern matches both voweled (حَدَّثَنَا) and unvoweled (حدثنا) forms.
function dv(word) {
  return [...word].map(c => c + D).join('')
}

// The canonical stripped forms of each transmission verb, used to normalise
// the captured verb before storing it.
const VERB_CANONICAL = {
  'حدثنا': 'حدثنا', 'حدثني': 'حدثني',
  'أخبرنا': 'أخبرنا', 'أخبرني': 'أخبرني',
  'أنبأنا': 'أنبأنا', 'أنبأني': 'أنبأني',
  'سمعنا': 'سمعنا', 'سمعت': 'سمعت',
  'أنه سمع': 'أنه سمع', 'أنها سمعت': 'أنها سمعت',
  'عن': 'عن', 'روى': 'روى', 'رواه': 'رواه',
}

function canonicalVerb(raw) {
  const stripped = stripDiacritics(raw).replace(/[،\s]/g, ' ').replace(/\s+/g, ' ').trim()
  return VERB_CANONICAL[stripped] ?? stripped
}

// Parse Arabic isnad into a list of { raw, verb } objects, preserving any
// diacritics (harakat) present in the original input.
// `raw`  — the narrator name fragment (with original diacritics)
// `verb` — the transmission verb that introduced this narrator (e.g. 'عن', 'حدثنا')
function parseIsnad(rawInput) {
  // Step 1: remove meta-connectors (قال : / يقول :) in a diacritic-aware way
  const normalized = rawInput
    .replace(new RegExp(`،?\\s*${dv('قال')}\\s*:`, 'g'), ' ')
    .replace(new RegExp(`،?\\s*${dv('يقول')}\\s*:`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Step 2: split on transmission verbs using a CAPTURING group so the matched
  // verb is included in the result array (at odd indices).
  // عن uses a diacritic-aware negative lookahead so عَنْهُ is not split.
  const verbPattern = [
    dv('حدثنا'), dv('حدثني'), dv('أخبرنا'), dv('أخبرني'),
    dv('أنبأنا'), dv('أنبأني'), dv('سمعنا'), dv('سمعت'),
    dv('أنه') + '\\s+' + dv('سمع'),
    dv('أنها') + '\\s+' + dv('سمعت'),
    dv('عن') + `(?!${D}[هاكمن])`,
    dv('روى'), dv('رواه'),
  ].join('|')

  const splitRe = new RegExp(`(،?\\s*(?:${verbPattern})\\s*)`, 'g')
  const parts = normalized.split(splitRe)
  // parts = [frag0, verb1, frag1, verb2, frag2, ...]
  // Even indices = narrator fragments, odd indices = verbs

  // Step 3: collect {raw, verb} pairs, skipping empty leading fragment
  const result = []
  for (let i = 0; i < parts.length; i += 2) {
    const raw = parts[i].replace(/[،,:]/g, '').trim()
    const verbRaw = i > 0 ? parts[i - 1] : null
    if (raw.length > 1) {
      result.push({ raw, verb: verbRaw ? canonicalVerb(verbRaw) : null })
    }
  }
  return result
}

function NarratorSearch({ initialName, onSelect }) {
  const [query, setQuery] = useState(initialName || '')
  const [results, setResults] = useState([])
  const [showCreate, setShowCreate] = useState(false)

  // Auto-search on mount so existing narrators appear immediately.
  // Strip diacritics for the API call so voweled queries match unvoweled DB entries.
  useEffect(() => {
    if (initialName?.trim()) search(initialName)
  }, [])

  async function search(q) {
    setQuery(q)
    if (!q.trim()) return setResults([])
    const apiQ = stripDiacritics(q)
    if (!apiQ.trim()) return setResults([])
    const res = await fetch(`/api/narrators?search=${encodeURIComponent(apiQ)}`)
    setResults(await res.json())
  }

  if (showCreate) {
    return (
      <NarratorMetaPanel
        narrator={{ name_arabic: query }}
        onSave={onSelect}
        onClose={() => setShowCreate(false)}
      />
    )
  }

  return (
    <div className="space-y-2">
      <input
        dir="rtl"
        value={query}
        onChange={e => search(e.target.value)}
        placeholder="Search narrators..."
        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        style={{ fontFamily: "'Amiri', serif" }}
      />
      {results.length > 0 && (
        <ul className="border border-gray-200 rounded divide-y divide-gray-100 max-h-40 overflow-y-auto">
          {results.map(n => (
            <li
              key={n.id}
              onClick={() => onSelect(n)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            >
              <span dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>{n.name_arabic}</span>
              {n.grade && <span className="text-xs text-gray-400">{n.grade}</span>}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => setShowCreate(true)}
        className="text-xs text-gray-500 hover:text-gray-800 underline"
      >
        + Create new narrator
      </button>
    </div>
  )
}

export default function FreeTextInput({ hadithBookId, onChainSaved }) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState([])
  const [step, setStep] = useState('input') // input | confirm | done
  const [editingIdx, setEditingIdx] = useState(null)
  const [saving, setSaving] = useState(false)

  function handleParse() {
    const items = parseIsnad(text)
    setParsed(items.map(({ raw, verb }) => ({ raw, verb, narrator: null })))
    setStep('confirm')
  }

  function handleNarratorSaved(idx, narrator) {
    setParsed(prev => prev.map((p, i) => i === idx ? { ...p, narrator } : p))
    setEditingIdx(null)
  }

  async function handleSaveChain() {
    if (parsed.some(p => !p.narrator)) {
      alert('Please resolve all narrators before saving.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/hadith-books/${hadithBookId}/chain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrators: parsed.map((p, i) => ({
            narrator_id: p.narrator.id,
            position: i,
            transmission_verb: p.verb || null,
          })),
        }),
      })
      onChainSaved(await res.json())
      setStep('done')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
        Chain saved.
        <button onClick={() => { setStep('input'); setText(''); setParsed([]) }} className="text-xs underline">
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {step === 'input' && (
        <>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            dir="rtl"
            rows={4}
            placeholder="الصق الإسناد هنا... مثال: حدثنا أ عن ب عن ج عن النبي ﷺ"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: '15px' }}
          />
          <button
            onClick={handleParse}
            disabled={!text.trim()}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Parse narrators
          </button>
        </>
      )}

      {step === 'confirm' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {parsed.length} narrator{parsed.length !== 1 ? 's' : ''} detected. Confirm or edit each one:
          </p>
          <ol className="space-y-2">
            {parsed.map((item, idx) => (
              <li key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white">
                  <span className="text-sm" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                    {item.raw}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.narrator
                      ? <span className="text-xs text-green-600 font-medium">{item.narrator.name_transliteration || item.narrator.name_arabic}</span>
                      : <span className="text-xs text-orange-500">Unresolved</span>
                    }
                    <button
                      onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                      className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2 py-0.5 rounded"
                    >
                      {item.narrator ? 'Edit' : 'Set'}
                    </button>
                  </div>
                </div>
                {editingIdx === idx && (
                  <div className="border-t border-gray-100 p-3">
                    <NarratorSearch
                      initialName={item.raw}
                      onSelect={n => handleNarratorSaved(idx, n)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('input')}
              className="text-sm text-gray-500 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSaveChain}
              disabled={saving || parsed.some(p => !p.narrator)}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : 'Save chain'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
