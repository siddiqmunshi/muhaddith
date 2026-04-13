import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import { toPng } from 'html-to-image'
import 'reactflow/dist/style.css'

import { buildGraph } from '../components/diagram/buildGraph'
import { toDrawioXml } from '../components/diagram/exportDrawio'
import NarratorNode from '../components/diagram/NarratorNode'
import BookNode from '../components/diagram/BookNode'
import MatnNode from '../components/diagram/MatnNode'
import NarratorPanel from '../components/diagram/NarratorPanel'
import BookStatusTable from '../components/diagram/BookStatusTable'
import GradeLegend from '../components/diagram/GradeLegend'
import { stripDiacritics } from '../utils/arabic'

const nodeTypes = { narrator: NarratorNode, book: BookNode, matn: MatnNode }

function slugify(str) {
  return (str || 'diagram')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .slice(0, 50)
}

function DiagramCanvas({ hadithId, filterBookId, onNodesEdgesReady, onFoundBooksLoaded }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNarrator, setSelectedNarrator] = useState(null)
  const [loading, setLoading] = useState(true)
  const { fitView } = useReactFlow()
  const canvasRef = useRef(null)

  // Store the full unfiltered graph so we can re-apply opacity without reloading
  const rawNodes = useRef([])
  const rawEdges = useRef([])
  // bookId → Set of node IDs belonging to that chain
  const bookToNodeIds = useRef(new Map())

  useEffect(() => { loadDiagram() }, [hadithId])

  async function loadDiagram() {
    setLoading(true)
    try {
      const booksRes = await fetch(`/api/hadiths/${hadithId}/books`)
      const allBooks = await booksRes.json()
      const foundBooks = allBooks.filter(b => b.status === 'found' && b.hadith_book_id)

      const chains = await Promise.all(
        foundBooks.map(async book => {
          const chainRes = await fetch(`/api/hadith-books/${book.hadith_book_id}/chain`)
          return { book, chain: await chainRes.json() }
        })
      )

      // Build node-membership map: bookId → Set of nodeIds in that chain
      const membership = new Map()
      for (const { book, chain } of chains) {
        const ids = new Set()
        chain.forEach(n => ids.add(`narrator-${n.id}`))
        ids.add(`book-${book.id}`)
        if (book.matn_arabic) ids.add(`matn-${book.id}`)
        membership.set(book.id, ids)
      }
      bookToNodeIds.current = membership

      const { nodes: graphNodes, edges: graphEdges } = buildGraph(chains)
      const nodesWithHandler = graphNodes.map(n =>
        n.type === 'narrator'
          ? { ...n, data: { ...n.data, onSelect: setSelectedNarrator } }
          : n
      )

      rawNodes.current = nodesWithHandler
      rawEdges.current = graphEdges
      setNodes(nodesWithHandler)
      setEdges(graphEdges)
      onNodesEdgesReady(nodesWithHandler, graphEdges)
      onFoundBooksLoaded(foundBooks)
      setTimeout(() => fitView({ padding: 0.2 }), 50)
    } finally {
      setLoading(false)
    }
  }

  // Apply opacity filter whenever filterBookId changes
  useEffect(() => {
    if (rawNodes.current.length === 0) return
    const highlighted = filterBookId ? bookToNodeIds.current.get(filterBookId) : null

    setNodes(rawNodes.current.map(n => ({
      ...n,
      style: { ...n.style, opacity: highlighted && !highlighted.has(n.id) ? 0.12 : 1 },
    })))
    setEdges(rawEdges.current.map(e => ({
      ...e,
      style: {
        ...e.style,
        opacity: highlighted && (!highlighted.has(e.source) || !highlighted.has(e.target)) ? 0.08 : 1,
      },
    })))
  }, [filterBookId])

  // PNG export
  const exportPng = useCallback(async (filename) => {
    fitView({ padding: 0.3 })
    await new Promise(r => setTimeout(r, 300))
    const el = document.querySelector('.react-flow__renderer')
    if (!el) return
    const dataUrl = await toPng(el, { backgroundColor: '#f9fafb', pixelRatio: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }, [fitView])

  useEffect(() => { window.__diagramExportPng = exportPng }, [exportPng])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
      Building diagram...
    </div>
  )

  if (nodes.length === 0) return (
    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
      No chains entered yet. Go to the Input page to add chains.
    </div>
  )

  return (
    <div className="flex-1 relative" ref={canvasRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={n => n.type === 'book' ? '#111827' : n.type === 'matn' ? '#fbbf24' : '#d1d5db'}
          maskColor="rgba(0,0,0,0.05)"
        />
      </ReactFlow>
      <NarratorPanel
        narrator={selectedNarrator}
        onClose={() => setSelectedNarrator(null)}
        onUpdated={(updated) => setSelectedNarrator(updated)}
      />
      <GradeLegend />
    </div>
  )
}

export default function DiagramPage() {
  const { projectId, hadithId } = useParams()
  const navigate = useNavigate()
  const [hadith, setHadith] = useState(null)
  const [books, setBooks] = useState([])
  const [foundBooks, setFoundBooks] = useState([])
  const [diagramNodes, setDiagramNodes] = useState([])
  const [diagramEdges, setDiagramEdges] = useState([])
  const [exporting, setExporting] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filterBookId, setFilterBookId] = useState(null)

  useEffect(() => {
    fetch(`/api/hadiths/${hadithId}`).then(r => r.json()).then(setHadith)
    fetch(`/api/hadiths/${hadithId}/books`).then(r => r.json()).then(setBooks)
  }, [hadithId])

  function handleNodesEdgesReady(nodes, edges) {
    setDiagramNodes(nodes)
    setDiagramEdges(edges)
  }

  async function exportPng() {
    if (!window.__diagramExportPng) return
    setExporting('png')
    try {
      await window.__diagramExportPng(`${slugify(hadith?.name)}.png`)
    } finally {
      setExporting(null)
    }
  }

  function exportDrawio() {
    setExporting('drawio')
    try {
      const xml = toDrawioXml(diagramNodes, diagramEdges)
      const blob = new Blob([xml], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slugify(hadith?.name)}.drawio`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="fixed inset-0 top-[105px] flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            title={sidebarOpen ? 'Hide checklist' : 'Show checklist'}
          >
            {sidebarOpen ? '← Hide checklist' : '→ Show checklist'}
          </button>
          <p className="text-sm font-medium text-gray-800">{hadith?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Chain filter — only shown when there are multiple found books */}
          {foundBooks.length > 1 && (
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setFilterBookId(null)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  !filterBookId ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              {foundBooks.map(b => (
                <button
                  key={b.id}
                  onClick={() => setFilterBookId(filterBookId === b.id ? null : b.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all max-w-[120px] truncate ${
                    filterBookId === b.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  dir="rtl"
                  style={{ fontFamily: "'Amiri', serif" }}
                  title={b.name_arabic}
                >
                  {stripDiacritics(b.name_arabic)}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={exportPng}
            disabled={!!exporting || diagramNodes.length === 0}
            className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {exporting === 'png' ? 'Exporting...' : 'Export PNG'}
          </button>
          <button
            onClick={exportDrawio}
            disabled={!!exporting || diagramNodes.length === 0}
            className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {exporting === 'drawio' ? 'Exporting...' : 'Export draw.io'}
          </button>
          <button
            onClick={() => navigate(`/projects/${projectId}/hadiths/${hadithId}/input`)}
            className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit input
          </button>
        </div>
      </div>

      {/* Main: sidebar + canvas */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <BookStatusTable books={books} />}
        <ReactFlowProvider>
          <DiagramCanvas
            hadithId={hadithId}
            filterBookId={filterBookId}
            onNodesEdgesReady={handleNodesEdgesReady}
            onFoundBooksLoaded={setFoundBooks}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}
