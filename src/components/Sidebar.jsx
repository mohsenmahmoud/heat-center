import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, GitBranch, MessageSquare, BarChart3, BookOpen, ChevronRight, UserCog } from 'lucide-react'
import useStore from '../store/useStore'

const agentNav = [
  { to: '/', icon: LayoutDashboard, label: 'مهامي اليوم' },
  { to: '/leads', icon: Users, label: 'ليدزي' },
  { to: '/pipeline', icon: GitBranch, label: 'خط الإنتاج' },
  { to: '/templates', icon: MessageSquare, label: 'قوالب الرسائل' },
  { to: '/playbook', icon: BookOpen, label: 'دليل المبيعات' },
]

const adminNav = [
  { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/leads', icon: Users, label: 'العملاء المحتملون' },
  { to: '/pipeline', icon: GitBranch, label: 'خط الإنتاج' },
  { to: '/templates', icon: MessageSquare, label: 'قوالب الرسائل' },
  { to: '/kpis', icon: BarChart3, label: 'مؤشرات الأداء' },
  { to: '/playbook', icon: BookOpen, label: 'دليل المبيعات' },
  { to: '/users', icon: UserCog, label: 'إدارة الحسابات' },
]

export default function Sidebar() {
  const currentUser = useStore((s) => s.currentUser)
  const isAdmin = currentUser?.role === 'admin'
  const navItems = isAdmin ? adminNav : agentNav

  return (
    <aside className="w-64 min-h-screen bg-[#1e1b4b] flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            ب
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">بنيان</h1>
            <p className="text-amber-400 text-xs font-medium">نظام إدارة العملاء</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-white' : 'text-indigo-400 group-hover:text-white'} />
                <span className="font-medium text-sm flex-1">{label}</span>
                {isActive && <ChevronRight size={16} className="opacity-70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-800">
        <div className="bg-indigo-900 rounded-xl p-3 text-center">
          <p className="text-indigo-300 text-xs">{currentUser?.name}</p>
          <p className="text-indigo-400 text-xs mt-0.5">{isAdmin ? 'مدير النظام' : 'مندوب مبيعات'}</p>
        </div>
      </div>
    </aside>
  )
}
