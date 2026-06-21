import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/new-audit', label: 'New Audit' },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-navy-900 text-white font-sans">
      <nav className="border-b border-border bg-navy-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-signal-600 flex items-center justify-center shadow-lg shadow-signal-600/30">
              <span className="text-white font-mono font-bold text-xs">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm leading-none">AISolutionsOS</span>
              <span className="text-slate-500 font-mono text-[10px] leading-none mt-0.5 tracking-wider">
                PERFORMANCE LAB
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-signal-600/20 text-signal-400 border border-signal-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
