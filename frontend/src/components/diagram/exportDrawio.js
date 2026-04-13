/**
 * Converts React Flow nodes + edges into a valid draw.io XML string.
 * The output can be opened directly in draw.io / diagrams.net for further editing.
 */

const NARRATOR_STYLE = (grade) => {
  const fills = {
    'ثقة':       '#f0fdf4',
    'حسن':       '#eff6ff',
    'صدوق':      '#ecfeff',
    'مختلف فيه': '#fefce8',
    'ضعيف':      '#fff7ed',
    'مجهول':     '#f9fafb',
    'متروك':     '#fef2f2',
    'كذاب':      '#fee2e2',
  }
  const strokes = {
    'ثقة':       '#4ade80',
    'حسن':       '#60a5fa',
    'صدوق':      '#22d3ee',
    'مختلف فيه': '#facc15',
    'ضعيف':      '#fb923c',
    'مجهول':     '#9ca3af',
    'متروك':     '#f87171',
    'كذاب':      '#dc2626',
  }
  const fill   = fills[grade]   ?? '#ffffff'
  const stroke = strokes[grade] ?? '#9ca3af'
  return `rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${stroke};fontStyle=1;fontSize=13;align=center;`
}

const BOOK_STYLE = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#111827;strokeColor=#374151;fontColor=#ffffff;fontStyle=1;fontSize=13;align=center;'
const MATN_STYLE = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#fffbeb;strokeColor=#fbbf24;fontSize=12;align=right;'
const EDGE_STYLE = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;'

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function toDrawioXml(nodes, edges) {
  let cells = ''
  let idCounter = 2 // 0 and 1 are reserved

  const idMap = {} // nodeId → drawio cell id

  for (const node of nodes) {
    const cellId = String(idCounter++)
    idMap[node.id] = cellId

    const x = Math.round(node.position.x)
    const y = Math.round(node.position.y)

    if (node.type === 'narrator') {
      const n = node.data.narrator
      const label = escapeXml(n.name_arabic) + (n.death_year ? `\\nd. ${n.death_year} AH` : '')
      const style = NARRATOR_STYLE(n.grade)
      cells += `<mxCell id="${cellId}" value="${label}" style="${style}" vertex="1" parent="1">
        <mxGeometry x="${x}" y="${y}" width="180" height="60" as="geometry"/>
      </mxCell>\n`
    }

    if (node.type === 'book') {
      const b = node.data.book
      const label = escapeXml(b.name_arabic)
      cells += `<mxCell id="${cellId}" value="${label}" style="${BOOK_STYLE}" vertex="1" parent="1">
        <mxGeometry x="${x}" y="${y}" width="180" height="50" as="geometry"/>
      </mxCell>\n`
    }

    if (node.type === 'matn') {
      const label = escapeXml(node.data.matn)
      cells += `<mxCell id="${cellId}" value="${label}" style="${MATN_STYLE}" vertex="1" parent="1">
        <mxGeometry x="${x}" y="${y}" width="220" height="120" as="geometry"/>
      </mxCell>\n`
    }
  }

  for (const edge of edges) {
    const cellId = String(idCounter++)
    const src = idMap[edge.source]
    const tgt = idMap[edge.target]
    if (!src || !tgt) continue
    cells += `<mxCell id="${cellId}" style="${EDGE_STYLE}" edge="1" source="${src}" target="${tgt}" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>\n`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    ${cells}
  </root>
</mxGraphModel>`
}
