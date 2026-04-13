import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { buildGraph } from '../components/diagram/buildGraph'
import NarratorNode from '../components/diagram/NarratorNode'
import BookNode from '../components/diagram/BookNode'
import MatnNode from '../components/diagram/MatnNode'
import NarratorPanel from '../components/diagram/NarratorPanel'
import BookStatusTable from '../components/diagram/BookStatusTable'

const nodeTypes = {
  narrator: NarratorNode,
  book: BookNode,
  matn: MatnNode,
}

function DiagramCanvas({ hadithId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNarrator, setSelectedNarrator] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDiagram()
  }, [hadithId])

  async function loadDiagram() {
    setLoading(true)
    try {
      // Fetch all books + their status for this hadith
      const booksRes = await fetch(`/api/hadiths/${hadithId}/books`)
      const allBooks = await booksRes.json()

      // For each found book fetch its chain
      const foundBooks = allBooks.filter(b => b.status === 'found' && b.hadith_book_id)
      const chains = await Promise.all(
        foundBooks.map(async book => {
          const chainRes = await fetch(`/api/hadith-books/${book.hadith_book_id}/chain`)
          const chain = await chainRes.json()
          return { book, chain }
        })
      )

      // Build graph — inject onSelect into each narrator node's data
      const { nodes: rawNodes, edges } = buildGraph(chains)
      const nodesWithHandler = rawNodes.map(n =>
        n.type === 'narrator'
          ? { ...n, data: { ...n.data, onSelect: setSelectedNarrator } }
          : n
      )

      setNodes(nodesWithHandler)
      setEdges(edges)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Building diagram...
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No chains entered yet. Go to the Input page to add chains.
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={n => {
            if (n.type === 'book') return '#111827'
            if (n.type === 'matn') return '#fbbf24'
            return '#d1d5db'
          }}
          maskColor="rgba(0,0,0,0.05)"
        />
      </ReactFlow>

      {/* Narrator metadata panel */}
      <NarratorPanel
        narrator={selectedNarrator}
        onClose={() => setSelectedNarrator(null)}
      />
    </div>
  )
}

export default function DiagramPage() {
  const { projectId, hadithId } = useParams()
  const navigate = useNavigate()
  const [hadith, setHadith] = useState(null)
  const [books, setBooks] = useState([])

  useEffect(() => {
    fetch(`/api/hadiths/${hadithId}`).then(r => r.json()).then(setHadith)
    fetch(`/api/hadiths/${hadithId}/books`).then(r => r.json()).then(setBooks)
  }, [hadithId])

  return (
    // Full-screen layout — override the max-w container from Layout
    <div className="fixed inset-0 top-[105px] flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center justify-between shrink-0">
        <p className="text-sm font-medium text-gray-800">{hadith?.name}</p>
        <button
          onClick={() => navigate(`/projects/${projectId}/hadiths/${hadithId}/input`)}
          className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Edit input
        </button>
      </div>

      {/* Main area: sidebar + canvas */}
      <div className="flex flex-1 overflow-hidden">
        <BookStatusTable books={books} />
        <ReactFlowProvider>
          <DiagramCanvas hadithId={hadithId} />
        </ReactFlowProvider>
      </div>
    </div>
  )
}
