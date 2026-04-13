import dagre from '@dagrejs/dagre'

const NODE_W = 180
const NODE_H = 60
const MATN_W = 220
const MATN_H = 120
const BOOK_W = 180
const BOOK_H = 50

/**
 * Given chains data (array of { book, chain: narrator[] }) build
 * React Flow nodes + edges with dagre layout applied.
 *
 * Shared narrators (same narrator.id across multiple chains) become a
 * single node — this is what produces the merging DAG structure.
 */
export function buildGraph(chains) {
  const nodes = []   // React Flow nodes
  const edges = []   // React Flow edges
  const nodeIds = new Set()

  function addNode(id, data, type = 'narrator') {
    if (!nodeIds.has(id)) {
      nodeIds.add(id)
      nodes.push({ id, type, data, position: { x: 0, y: 0 } })
    }
  }

  function addEdge(source, target) {
    const id = `e-${source}-${target}`
    if (!edges.find(e => e.id === id)) {
      edges.push({
        id,
        source,
        target,
        type: 'smoothstep',
        style: { stroke: '#9ca3af', strokeWidth: 1.5 },
        markerEnd: { type: 'ArrowClosed', color: '#9ca3af' },
      })
    }
  }

  for (const { book, chain } of chains) {
    if (!chain || chain.length === 0) continue

    // Narrator nodes + narrator→narrator edges
    for (let i = 0; i < chain.length; i++) {
      const n = chain[i]
      const nId = `narrator-${n.id}`
      addNode(nId, { narrator: n }, 'narrator')
      if (i > 0) {
        addEdge(`narrator-${chain[i - 1].id}`, nId)
      }
    }

    // Book node
    const bookId = `book-${book.id}`
    addNode(bookId, { book }, 'book')

    // Last narrator → book
    const lastNarrator = chain[chain.length - 1]
    addEdge(`narrator-${lastNarrator.id}`, bookId)

    // Matn node (only if matn exists)
    if (book.matn_arabic) {
      const matnId = `matn-${book.id}`
      addNode(matnId, { matn: book.matn_arabic, bookName: book.name_arabic }, 'matn')
      addEdge(bookId, matnId)
    }
  }

  // Apply dagre layout
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 60, marginx: 40, marginy: 40 })

  for (const node of nodes) {
    const w = node.type === 'matn' ? MATN_W : node.type === 'book' ? BOOK_W : NODE_W
    const h = node.type === 'matn' ? MATN_H : node.type === 'book' ? BOOK_H : NODE_H
    g.setNode(node.id, { width: w, height: h })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  // Apply positions
  const layoutedNodes = nodes.map(node => {
    const { x, y } = g.node(node.id)
    const w = node.type === 'matn' ? MATN_W : node.type === 'book' ? BOOK_W : NODE_W
    const h = node.type === 'matn' ? MATN_H : node.type === 'book' ? BOOK_H : NODE_H
    return { ...node, position: { x: x - w / 2, y: y - h / 2 } }
  })

  return { nodes: layoutedNodes, edges }
}
