import { Handle, Position } from 'reactflow'

const GRADE_STYLES = {
  'ثقة':       'bg-green-50  border-green-400  text-green-800',
  'حسن':       'bg-blue-50   border-blue-400   text-blue-800',
  'صدوق':      'bg-cyan-50   border-cyan-400   text-cyan-800',
  'مختلف فيه': 'bg-yellow-50 border-yellow-400 text-yellow-800',
  'ضعيف':      'bg-orange-50 border-orange-400 text-orange-800',
  'مجهول':     'bg-gray-100  border-gray-400   text-gray-700',
  'متروك':     'bg-red-50    border-red-400    text-red-800',
  'كذاب':      'bg-red-100   border-red-600    text-red-900',
}

const DEFAULT_STYLE = 'bg-white border-gray-300 text-gray-800'

export default function NarratorNode({ data, selected }) {
  const { narrator, onSelect } = data
  const style = GRADE_STYLES[narrator.grade] ?? DEFAULT_STYLE

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div
        onClick={() => onSelect?.(narrator)}
        className={`border-2 rounded-lg px-3 py-2 w-44 cursor-pointer shadow-sm transition-shadow hover:shadow-md ${style} ${selected ? 'ring-2 ring-offset-1 ring-gray-500' : ''}`}
      >
        <p
          className="text-sm font-medium text-center leading-snug"
          dir="rtl"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
        >
          {narrator.name_arabic}
        </p>
        {narrator.death_year && (
          <p className="text-xs text-center opacity-60 mt-0.5">d. {narrator.death_year} AH</p>
        )}
        {narrator.grade && (
          <p className="text-xs text-center opacity-70 mt-0.5">{narrator.grade}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </>
  )
}
