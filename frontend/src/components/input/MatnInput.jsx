import { useState } from 'react'

export default function MatnInput({ hadithBookId, initialValue, onSaved }) {
  const [matn, setMatn] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!hadithBookId) return
    setSaving(true)
    try {
      await fetch(`/api/hadith-books/${hadithBookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matn_arabic: matn }),
      })
      onSaved(matn)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={matn}
        onChange={e => { setMatn(e.target.value); setSaved(false) }}
        dir="rtl"
        rows={5}
        placeholder="أدخل نص الحديث هنا..."
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-400 font-arabic resize-y"
        style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: '16px' }}
      />
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving || !matn.trim()}
          className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save matn'}
        </button>
      </div>
    </div>
  )
}
