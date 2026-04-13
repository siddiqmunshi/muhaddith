import { useState } from 'react'
import NarratorMetaPanel from '../input/NarratorMetaPanel'

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

export default function NarratorPanel({ narrator, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState(null) // tracks latest saved state

  // Use the latest saved version if we have one, otherwise the prop
  const displayed = current ?? narrator

  if (!narrator) return null

  if (editing) {
    return (
      <div className="absolute top-4 right-4 z-10 w-80">
        <NarratorMetaPanel
          narrator={displayed}
          onSave={(updated) => {
            setCurrent(updated)
            setEditing(false)
            onUpdated?.(updated)
          }}
          onClose={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="absolute top-4 right-4 z-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-lg font-semibold text-gray-900 leading-snug"
          dir="rtl"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {displayed.name_arabic}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-2 py-0.5 rounded"
          >
            Edit
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      </div>

      {displayed.name_transliteration && (
        <p className="text-sm text-gray-500 -mt-2">{displayed.name_transliteration}</p>
      )}

      {displayed.grade && (
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${GRADE_BADGE[displayed.grade] ?? 'bg-gray-100 text-gray-700'}`}>
          {displayed.grade}
        </span>
      )}

      <dl className="space-y-2 text-sm">
        {displayed.is_companion && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0">Status</dt>
            <dd className="text-gray-800 font-medium">Sahabi</dd>
          </div>
        )}
        {(displayed.birth_year || displayed.death_year) && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0">Dates (AH)</dt>
            <dd className="text-gray-800">
              {displayed.birth_year ? `b. ${displayed.birth_year}` : ''}
              {displayed.birth_year && displayed.death_year ? ' — ' : ''}
              {displayed.death_year ? `d. ${displayed.death_year}` : ''}
            </dd>
          </div>
        )}
        {displayed.location && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0">Location</dt>
            <dd className="text-gray-800">{displayed.location}</dd>
          </div>
        )}
        {displayed.grade_notes && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0 pt-0.5">Notes</dt>
            <dd className="text-gray-700 text-xs leading-relaxed">{displayed.grade_notes}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
