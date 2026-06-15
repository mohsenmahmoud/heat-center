import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AgentHome from './pages/AgentHome'
import Leads from './pages/Leads'
import Pipeline from './pages/Pipeline'
import Templates from './pages/Templates'
import KPIs from './pages/KPIs'
import Playbook from './pages/Playbook'
import AdminUsers from './pages/AdminUsers'

function RequireAuth({ children }) {
  const currentUser = useStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function Layout() {
  const location = useLocation()
  const currentUser = useStore((s) => s.currentUser)
  const isAdmin = currentUser?.role === 'admin'

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header pathname={location.pathname} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={isAdmin ? <Dashboard /> : <AgentHome />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/playbook" element={<Playbook />} />
            {isAdmin && <Route path="/users" element={<AdminUsers />} />}
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<RequireAuth><Layout /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
