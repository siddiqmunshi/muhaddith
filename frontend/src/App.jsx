import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProjectPage from './pages/ProjectPage'
import InputPage from './pages/InputPage'
import DiagramPage from './pages/DiagramPage'
import NarratorsPage from './pages/NarratorsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="narrators" element={<NarratorsPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
        <Route path="projects/:projectId/hadiths/:hadithId/input" element={<InputPage />} />
        <Route path="projects/:projectId/hadiths/:hadithId/diagram" element={<DiagramPage />} />
      </Route>
    </Routes>
  )
}
