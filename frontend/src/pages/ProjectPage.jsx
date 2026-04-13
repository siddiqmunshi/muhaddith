import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [hadiths, setHadiths] = useState([])
  const [newName, setNewName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([fetchProject(), fetchHadiths()]).finally(() => setLoading(false))
  }, [projectId])

  async function fetchProject() {
    const res = await fetch(`/api/projects/${projectId}`)
    const data = await res.json()
    setProject(data)
    setDraftName(data.name)
  }

  async function fetchHadiths() {
    const res = await fetch(`/api/projects/${projectId}/hadiths`)
    const data = await res.json()
    setHadiths(data)
  }

  async function renameProject() {
    if (!draftName.trim() || draftName === project.name) {
      setEditingName(false)
      return
    }
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: draftName.trim() }),
    })
    const updated = await res.json()
    setProject(updated)
    setEditingName(false)
  }

  async function createHadith(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/hadiths`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const hadith = await res.json()
      setHadiths(prev => [hadith, ...prev])
      setNewName('')
    } catch (err) {
      setError('Failed to create hadith')
    } finally {
      setCreating(false)
    }
  }

  async function deleteHadith(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this hadith and all its chains?')) return
    try {
      await fetch(`/api/hadiths/${id}`, { method: 'DELETE' })
      setHadiths(prev => prev.filter(h => h.id !== id))
    } catch (err) {
      setError('Failed to delete hadith')
    }
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <div>
      {/* Project title — inline editable */}
      <div className="mb-8">
        {editingName ? (
          <input
            autoFocus
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onBlur={renameProject}
            onKeyDown={e => e.key === 'Enter' && renameProject()}
            className="text-2xl font-semibold text-gray-900 border-b border-gray-400 focus:outline-none bg-transparent w-full"
          />
        ) : (
          <h1
            onClick={() => setEditingName(true)}
            className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-600 inline-block"
            title="Click to rename"
          >
            {project?.name}
          </h1>
        )}
        <p className="text-gray-500 text-sm mt-1">
          Each hadith is a narration you want to trace across multiple books.
        </p>
      </div>

      {/* Create form */}
      <form onSubmit={createHadith} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Hadith name (e.g. Aisha's Hadith on the Masjid)"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {creating ? 'Creating...' : 'Add hadith'}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Hadith list */}
      {hadiths.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No hadiths yet</p>
          <p className="text-sm">Add the first hadith to this project above.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {hadiths.map(hadith => (
            <li
              key={hadith.id}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{hadith.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Created {new Date(hadith.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/projects/${projectId}/hadiths/${hadith.id}/input`)}
                  className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Input
                </button>
                <button
                  onClick={() => navigate(`/projects/${projectId}/hadiths/${hadith.id}/diagram`)}
                  className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Diagram
                </button>
                <button
                  onClick={e => deleteHadith(hadith.id, e)}
                  className="text-gray-300 hover:text-red-500 text-sm transition-colors px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
