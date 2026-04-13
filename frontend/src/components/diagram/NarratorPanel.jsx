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

export default function NarratorPanel({ narrator, onClose }) {
  if (!narrator) return null

  return (
    <div className="absolute top-4 right-4 z-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-lg font-semibold text-gray-900 leading-snug"
          dir="rtl"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {narrator.name_arabic}
        </p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">✕</button>
      </div>

      {narrator.name_transliteration && (
        <p className="text-sm text-gray-500 -mt-2">{narrator.name_transliteration}</p>
      )}

      {narrator.grade && (
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${GRADE_BADGE[narrator.grade] ?? 'bg-gray-100 text-gray-700'}`}>
          {narrator.grade}
        </span>
      )}

      <dl className="space-y-2 text-sm">
        {narrator.is_companion && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0">Status</dt>
            <dd className="text-gray-800 font-medium">Sahabi</dd>
          </div>
        )}
        {(narrator.birth_year || narrator.death_year) && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0">Dates (AH)</dt>
            <dd className="text-gray-800">
              {narrator.birth_year ? `b. ${narrator.birth_year}` : ''}
              {narrator.birth_year && narrator.death_year ? ' — ' : ''}
              {narrator.death_year ? `d. ${narrator.death_year}` : ''}
            </dd>
          </div>
        )}
        {narrator.location && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0">Location</dt>
            <dd className="text-gray-800">{narrator.location}</dd>
          </div>
        )}
        {narrator.grade_notes && (
          <div className="flex gap-2">
            <dt className="text-gray-400 w-24 shrink-0 pt-0.5">Notes</dt>
            <dd className="text-gray-700 text-xs leading-relaxed">{narrator.grade_notes}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
