import { useState } from 'react'

const GRADES = [
  { grade: 'ثقة',       label: 'Thiqa — Trustworthy',         style: 'bg-green-50  border-green-400  text-green-800' },
  { grade: 'حسن',       label: 'Hasan — Good',                style: 'bg-blue-50   border-blue-400   text-blue-800' },
  { grade: 'صدوق',      label: 'Saduq — Truthful',            style: 'bg-cyan-50   border-cyan-400   text-cyan-800' },
  { grade: 'مختلف فيه', label: 'Mukhtalaf fihi — Disputed',   style: 'bg-yellow-50 border-yellow-400 text-yellow-800' },
  { grade: 'ضعيف',      label: 'Da\'if — Weak',               style: 'bg-orange-50 border-orange-400 text-orange-800' },
  { grade: 'مجهول',     label: 'Majhul — Unknown',            style: 'bg-gray-100  border-gray-400   text-gray-700' },
  { grade: 'متروك',     label: 'Matruk — Abandoned',          style: 'bg-red-50    border-red-400    text-red-800' },
  { grade: 'كذاب',      label: 'Kadhdhab — Liar',             style: 'bg-red-100   border-red-600    text-red-900' },
]

export default function GradeLegend() {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute bottom-10 left-4 z-10">
      {open && (
        <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Narrator grades</p>
          {GRADES.map(({ grade, label, style }) => (
            <div key={grade} className="flex items-center gap-2">
              <span
                className={`border-2 rounded px-2 py-0.5 text-xs font-medium shrink-0 ${style}`}
                dir="rtl"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {grade}
              </span>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
      >
        {open ? 'Hide legend' : 'Grade legend'}
      </button>
    </div>
  )
}
