import { useState } from 'react'

// Expected JSON format:
// { "narrators": [{ "name_arabic": "...", "name_transliteration": "...", "grade": "..." }], "matn": "..." }

export default function FileImport({ hadithBookId, onChainSaved }) {
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleFile(e) {
    setError(null)
    setPreview(null)
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data.narrators)) {
          throw new Error('JSON must have a "narrators" array')
        }
        data.narrators.forEach((n, i) => {
          if (!n.name_arabic) throw new Error(`Narrator at index ${i} missing "name_arabic"`)
        })
        setPreview(data)
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!preview) return
    setSaving(true)
    try {
      // Create any narrators that don't exist yet
      const resolved = []
      for (const n of preview.narrators) {
        const res = await fetch('/api/narrators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n),
        })
        resolved.push(await res.json())
      }

      // Save chain
      const chainRes = await fetch(`/api/hadith-books/${hadithBookId}/chain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrators: resolved.map((n, i) => ({ narrator_id: n.id, position: i })),
        }),
      })
      onChainSaved(await chainRes.json())
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        Chain imported successfully.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Format guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-700">Expected JSON format:</p>
        <pre className="font-mono text-xs overflow-x-auto">{`{
  "narrators": [
    { "name_arabic": "اسم الراوي", "grade": "ثقة" },
    ...
  ],
  "matn": "نص الحديث (optional)"
}`}</pre>
      </div>

      <input
        type="file"
        accept=".json"
        onChange={handleFile}
        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-50"
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {preview && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {preview.narrators.length} narrator{preview.narrators.length !== 1 ? 's' : ''} found in file:
          </p>
          <ol className="space-y-1">
            {preview.narrators.map((n, i) => (
              <li key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded px-3 py-2 text-sm">
                <span className="text-xs text-gray-400">{i + 1}</span>
                <span dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>{n.name_arabic}</span>
                {n.grade && <span className="text-xs text-gray-400 ml-auto">{n.grade}</span>}
              </li>
            ))}
          </ol>
          <button
            onClick={handleImport}
            disabled={saving}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Importing...' : 'Import chain'}
          </button>
        </div>
      )}
    </div>
  )
}
