import { useState } from 'react'
import NarratorMetaPanel from './NarratorMetaPanel'

function NarratorSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showCreate, setShowCreate] = useState(false)

  async function search(q) {
    setQuery(q)
    if (!q.trim()) return setResults([])
    const res = await fetch(`/api/narrators?search=${encodeURIComponent(q)}`)
    setResults(await res.json())
  }

  if (showCreate) {
    return (
      <NarratorMetaPanel
        narrator={{ name_arabic: query }}
        onSave={(n) => { onSelect(n); setShowCreate(false); setQuery('') }}
        onClose={() => setShowCreate(false)}
      />
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          dir="rtl"
          value={query}
          onChange={e => search(e.target.value)}
          placeholder="ابحث عن راوٍ..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          style={{ fontFamily: "'Amiri', serif" }}
        />
        <button
          onClick={() => setShowCreate(true)}
          className="text-sm border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          + New
        </button>
      </div>
      {results.length > 0 && (
        <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-44 overflow-y-auto">
          {results.map(n => (
            <li
              key={n.id}
              onClick={() => { onSelect(n); setQuery(''); setResults([]) }}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            >
              <span dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>{n.name_arabic}</span>
              <span className="text-xs text-gray-400">{n.grade || ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function StructuredInput({ hadithBookId, onChainSaved }) {
  const [chain, setChain] = useState([]) // ordered narrator objects
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addNarrator(narrator) {
    setChain(prev => [...prev, narrator])
    setSaved(false)
  }

  function removeNarrator(idx) {
    setChain(prev => prev.filter((_, i) => i !== idx))
    setSaved(false)
  }

  function moveUp(idx) {
    if (idx === 0) return
    setChain(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  function moveDown(idx) {
    if (idx === chain.length - 1) return
    setChain(prev => {
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  async function saveChain() {
    if (chain.length === 0) return
    setSaving(true)
    try {
      const res = await fetch(`/api/hadith-books/${hadithBookId}/chain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrators: chain.map((n, i) => ({ narrator_id: n.id, position: i })),
        }),
      })
      onChainSaved(await res.json())
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Built chain */}
      {chain.length > 0 && (
        <ol className="space-y-1">
          {chain.map((n, idx) => (
            <li key={idx} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}</span>
              <span className="flex-1 text-sm" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                {n.name_arabic}
              </span>
              {n.grade && <span className="text-xs text-gray-400">{n.grade}</span>}
              <div className="flex gap-1">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 px-1">↑</button>
                <button onClick={() => moveDown(idx)} disabled={idx === chain.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 px-1">↓</button>
                <button onClick={() => removeNarrator(idx)} className="text-gray-300 hover:text-red-500 px-1 ml-1">✕</button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Search + add */}
      <NarratorSearch onSelect={addNarrator} />

      {/* Save */}
      {chain.length > 0 && (
        <button
          onClick={saveChain}
          disabled={saving}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40'
          }`}
        >
          {saved ? 'Chain saved' : saving ? 'Saving...' : 'Save chain'}
        </button>
      )}
    </div>
  )
}
