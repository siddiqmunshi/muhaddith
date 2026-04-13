import { useState, useEffect } from 'react'
import NarratorMetaPanel from '../components/input/NarratorMetaPanel'
import { stripDiacritics } from '../utils/arabic'

const GRADE_BADGE = {
  'ثقة':       'bg-green-100  text-green-800',
  'حسن':       'bg-blue-100   text-blue-800',
  'صدوق':      'bg-cyan-100   text-cyan-800',
  'مختلف فيه': 'bg-yellow-100 text-yellow-800',
  'ضعيف':      'bg-orange-100 text-orange-800',
  'مجهول':     'bg-gray-100   text-gray-700',
  'متروك':     'bg-red-100    text-red-700',
  'كذاب':      'bg-red-200    text-red-900',
}

export default function NarratorsPage() {
  const [narrators, setNarrators] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)       // narrator being edited
  const [expanded, setExpanded] = useState(null)     // narrator id whose appearances are shown
  const [appearances, setAppearances] = useState({}) // narratorId → appearances[]

  useEffect(() => { fetchNarrators() }, [])

  async function fetchNarrators() {
    setLoading(true)
    try {
      const res = await fetch('/api/narrators')
      setNarrators(await res.json())
    } finally {
      setLoading(false)
    }
  }

  async function loadAppearances(id) {
    if (appearances[id]) return // already loaded
    const res = await fetch(`/api/narrators/${id}/appearances`)
    const data = await res.json()
    setAppearances(prev => ({ ...prev, [id]: data }))
  }

  function handleToggleExpand(id) {
    if (expanded === id) {
      setExpanded(null)
    } else {
      setExpanded(id)
      loadAppearances(id)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this narrator? This will also remove them from any saved chains.')) return
    await fetch(`/api/narrators/${id}`, { method: 'DELETE' })
    setNarrators(prev => prev.filter(n => n.id !== id))
    if (expanded === id) setExpanded(null)
  }

  function handleSaved(updated) {
    setNarrators(prev => prev.map(n => n.id === updated.id ? updated : n))
    setEditing(null)
  }

  const filtered = narrators.filter(n => {
    if (!search.trim()) return true
    const q = stripDiacritics(search).toLowerCase()
    return (
      stripDiacritics(n.name_arabic).toLowerCase().includes(q) ||
      (n.name_transliteration || '').toLowerCase().includes(q)
    )
  })

  if (editing) {
    return (
      <div className="max-w-xl">
        <button
          onClick={() => setEditing(null)}
          className="text-sm text-gray-500 mb-4 hover:text-gray-800"
        >
          ← Back to narrators
        </button>
        <NarratorMetaPanel
          narrator={editing}
          onSave={handleSaved}
          onClose={() => setEditing(null)}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Narrators</h1>
        <p className="text-gray-500 text-sm">All narrator records shared across your projects.</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name..."
        dir="rtl"
        className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 mb-6"
        style={{ fontFamily: "'Amiri', serif" }}
      />

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No narrators found.</p>
      ) : (
        <div className="space-y-px">
          {filtered.map(n => (
            <div key={n.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-1">
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0 flex items-center gap-3">
                  <div>
                    <p
                      className="text-sm font-medium text-gray-900"
                      dir="rtl"
                      style={{ fontFamily: "'Amiri', serif" }}
                    >
                      {n.name_arabic}
                    </p>
                    {n.name_transliteration && (
                      <p className="text-xs text-gray-400">{n.name_transliteration}</p>
                    )}
                  </div>
                  {n.grade && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${GRADE_BADGE[n.grade] ?? 'bg-gray-100 text-gray-700'}`}>
                      {n.grade}
                    </span>
                  )}
                  {n.death_year && (
                    <span className="text-xs text-gray-400 shrink-0">d. {n.death_year} AH</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleExpand(n.id)}
                    className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    {expanded === n.id ? 'Hide' : 'Appears in'}
                  </button>
                  <button
                    onClick={() => setEditing(n)}
                    className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-xs text-gray-300 hover:text-red-500 px-1 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Appearances panel */}
              {expanded === n.id && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  {!appearances[n.id] ? (
                    <p className="text-xs text-gray-400">Loading...</p>
                  ) : appearances[n.id].length === 0 ? (
                    <p className="text-xs text-gray-400">Not used in any chain yet.</p>
                  ) : (
                    <ul className="space-y-1">
                      {appearances[n.id].map((a, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="text-gray-400">{a.project_name} /</span>
                          <span>{a.hadith_name}</span>
                          <span className="text-gray-400">—</span>
                          <span dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>{a.book_name_arabic}</span>
                          <span className="text-gray-300">pos. {a.position + 1}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">{filtered.length} narrator{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
