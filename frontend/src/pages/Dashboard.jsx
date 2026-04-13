import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function createProject(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const project = await res.json()
      setProjects(prev => [project, ...prev])
      setNewName('')
    } catch (err) {
      setError('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  async function deleteProject(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this project and all its hadiths?')) return
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Projects</h1>
        <p className="text-gray-500 text-sm">Each project is a book or research topic containing one or more hadiths.</p>
      </div>

      {/* Create form */}
      <form onSubmit={createProject} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New project name (e.g. Women in the Masjid)"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {creating ? 'Creating...' : 'Create project'}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Project list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No projects yet</p>
          <p className="text-sm">Create your first project above to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map(project => (
            <li
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex items-center justify-between cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-medium text-gray-900">{project.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={e => deleteProject(project.id, e)}
                className="text-gray-300 hover:text-red-500 text-sm transition-colors px-2 py-1"
                title="Delete project"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
