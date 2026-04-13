import { Handle, Position } from 'reactflow'

export default function MatnNode({ data }) {
  const { matn } = data
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2.5 w-56 shadow-sm">
        <p
          className="text-xs text-amber-900 leading-relaxed text-right line-clamp-5"
          dir="rtl"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: '13px' }}
        >
          {matn}
        </p>
      </div>
    </>
  )
}
