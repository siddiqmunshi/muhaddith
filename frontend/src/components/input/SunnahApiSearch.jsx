import { useState } from 'react'

// sunnah.com collection short codes mapped to our book short_codes
const SUNNAH_COLLECTION_MAP = {
  bukhari: 'sahih-bukhari',
  muslim: 'sahih-muslim',
  abudawud: 'abu-dawud',
  tirmidhi: 'tirmidhi',
  nasai: 'nasai',
  ibnmajah: 'ibn-majah',
  muwatta: 'malik',
  musnad_ahmad: 'ahmed',
}

export default function SunnahApiSearch({ hadithBookId, bookShortCode, onChainSaved, onMatnFound }) {
  const [hadithNumber, setHadithNumber] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)

  const collection = SUNNAH_COLLECTION_MAP[bookShortCode]

  async function search() {
    if (!hadithNumber.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(
        `/api/sunnah/collections/${collection}/hadiths/${hadithNumber}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function importResult() {
    if (!result) return
    setImporting(true)
    try {
      // Pass matn back to parent
      const matn = result.hadith?.[0]?.body || result.body || ''
      if (matn) onMatnFound(matn)

      // sunnah.com doesn't return full isnad data via the free API —
      // notify user to enter chain manually
      onChainSaved([])
      setImported(true)
    } finally {
      setImporting(false)
    }
  }

  if (!collection) {
    return (
      <p className="text-sm text-gray-400 italic">
        sunnah.com search is not available for this book.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Look up a hadith by number in <span className="font-medium">{collection}</span> on sunnah.com.
        The matn will be pre-filled; the chain must be entered manually.
      </p>

      <div className="flex gap-2">
        <input
          type="number"
          value={hadithNumber}
          onChange={e => setHadithNumber(e.target.value)}
          placeholder="Hadith number"
          className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          onClick={search}
          disabled={loading || !hadithNumber.trim()}
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {result && !imported && (
        <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</p>
          <p
            dir="rtl"
            className="text-sm leading-relaxed text-gray-800"
            style={{ fontFamily: "'Amiri', serif", fontSize: '15px' }}
          >
            {result.hadith?.[0]?.body || result.body || 'No Arabic text returned'}
          </p>
          <button
            onClick={importResult}
            disabled={importing}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {importing ? 'Importing...' : 'Use this — pre-fill matn'}
          </button>
        </div>
      )}

      {imported && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Matn pre-filled. Please enter the chain manually using Free text or Form mode.
        </p>
      )}
    </div>
  )
}
