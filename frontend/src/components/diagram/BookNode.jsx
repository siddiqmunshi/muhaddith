import { Handle, Position } from 'reactflow'

export default function BookNode({ data }) {
  const { book } = data
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div className="bg-gray-900 text-white border-2 border-gray-700 rounded-lg px-4 py-2.5 w-44 shadow-sm">
        <p
          className="text-sm font-semibold text-center leading-snug"
          dir="rtl"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
        >
          {book.name_arabic}
        </p>
        <p className="text-xs text-center text-gray-400 mt-0.5 truncate">{book.name_english}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </>
  )
}
