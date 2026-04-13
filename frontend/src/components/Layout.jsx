import { Outlet, Link, useLocation } from 'react-router-dom'

function Breadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = []
  if (segments[0] === 'projects' && segments[1]) {
    crumbs.push({ label: 'Project', to: `/projects/${segments[1]}` })
  }
  if (segments[2] === 'hadiths' && segments[3]) {
    if (segments[4] === 'input') crumbs.push({ label: 'Input', to: null })
    if (segments[4] === 'diagram') crumbs.push({ label: 'Diagram', to: null })
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-2 text-sm text-gray-500 flex items-center gap-2">
      <Link to="/" className="hover:text-gray-800">Dashboard</Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>/</span>
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-gray-800">{crumb.label}</Link>
          ) : (
            <span className="text-gray-800 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-xl font-semibold text-gray-900 tracking-tight">
          محدّث <span className="text-gray-400 font-normal text-base">Muhaddith</span>
        </Link>
        <Link to="/narrators" className="text-sm text-gray-500 hover:text-gray-800 transition-colors ml-4">
          Narrators
        </Link>
      </header>

      <Breadcrumb />

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
