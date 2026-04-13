import { useState } from 'react'

const GRADES = [
  { value: 'ثقة',         label: 'ثقة — Trustworthy',      color: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'حسن',         label: 'حسن — Good',             color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'صدوق',        label: 'صدوق — Honest',          color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  { value: 'مختلف فيه',   label: 'مختلف فيه — Disputed',   color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'ضعيف',        label: 'ضعيف — Weak',            color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { value: 'مجهول',       label: 'مجهول — Unknown',        color: 'text-gray-600 bg-gray-50 border-gray-200' },
  { value: 'متروك',       label: 'متروك — Abandoned',      color: 'text-red-700 bg-red-50 border-red-200' },
  { value: 'كذاب',        label: 'كذاب — Liar',            color: 'text-red-900 bg-red-100 border-red-300' },
]

export function gradeStyle(grade) {
  return GRADES.find(g => g.value === grade)?.color ?? 'text-gray-500 bg-gray-50 border-gray-200'
}

export default function NarratorMetaPanel({ narrator, onSave, onClose }) {
  const [form, setForm] = useState({
    name_arabic: narrator?.name_arabic || '',
    name_transliteration: narrator?.name_transliteration || '',
    birth_year: narrator?.birth_year || '',
    death_year: narrator?.death_year || '',
    location: narrator?.location || '',
    grade: narrator?.grade || '',
    grade_notes: narrator?.grade_notes || '',
    is_companion: narrator?.is_companion || false,
  })
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    if (!form.name_arabic.trim()) return
    setSaving(true)
    try {
      const method = narrator?.id ? 'PATCH' : 'POST'
      const url = narrator?.id ? `/api/narrators/${narrator.id}` : '/api/narrators'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          birth_year: form.birth_year ? Number(form.birth_year) : null,
          death_year: form.death_year ? Number(form.death_year) : null,
        }),
      })
      const saved = await res.json()
      onSave(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          {narrator?.id ? 'Edit narrator' : 'New narrator'}
        </p>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Name (Arabic) *</label>
          <input
            dir="rtl"
            value={form.name_arabic}
            onChange={e => set('name_arabic', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Name (transliteration)</label>
          <input
            value={form.name_transliteration}
            onChange={e => set('name_transliteration', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Birth year (AH)</label>
          <input
            type="number"
            value={form.birth_year}
            onChange={e => set('birth_year', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Death year (AH)</label>
          <input
            type="number"
            value={form.death_year}
            onChange={e => set('death_year', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Location / city</label>
          <input
            value={form.location}
            onChange={e => set('location', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Grade (جرح وتعديل)</label>
          <div className="grid grid-cols-2 gap-1.5">
            {GRADES.map(g => (
              <button
                key={g.value}
                onClick={() => set('grade', g.value)}
                className={`text-xs px-2 py-1.5 rounded border text-right transition-all ${
                  form.grade === g.value ? g.color + ' font-medium' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
                dir="rtl"
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Grade notes</label>
          <textarea
            value={form.grade_notes}
            onChange={e => set('grade_notes', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="is_companion"
            checked={form.is_companion}
            onChange={e => set('is_companion', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="is_companion" className="text-xs text-gray-600">
            Sahabi (companion of the Prophet)
          </label>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving || !form.name_arabic.trim()}
        className="w-full bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
      >
        {saving ? 'Saving...' : narrator?.id ? 'Update narrator' : 'Add narrator'}
      </button>
    </div>
  )
}
