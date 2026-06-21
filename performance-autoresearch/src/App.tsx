import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewAudit from './pages/NewAudit'
import ProjectAudit from './pages/ProjectAudit'
import ReportExport from './pages/ReportExport'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-audit" element={<NewAudit />} />
          <Route path="/project/:id" element={<ProjectAudit />} />
          <Route path="/project/:id/report" element={<ReportExport />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
