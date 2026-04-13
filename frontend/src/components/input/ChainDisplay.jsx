import { gradeStyle } from './NarratorMetaPanel'

export default function ChainDisplay({ chain }) {
  return (
    <ol className="flex flex-col items-center gap-0">
      {chain.map((n, idx) => (
        <li key={idx} className="flex flex-col items-center">
          <div className={`border rounded-lg px-4 py-2 text-sm font-medium text-center min-w-32 ${gradeStyle(n.grade)}`}>
            <p dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>{n.name_arabic}</p>
            {n.death_year && <p className="text-xs opacity-60 mt-0.5">d. {n.death_year} AH</p>}
          </div>
          {idx < chain.length - 1 && (
            <div className="w-px h-5 bg-gray-300" />
          )}
        </li>
      ))}
    </ol>
  )
}
