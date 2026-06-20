import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Truck, Snowflake } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', label: '总览', icon: LayoutDashboard },
  { to: '/incidents', label: '异常处理', icon: AlertTriangle },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-200 bg-slate-900">
      <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20">
          <Snowflake className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">冷链调度台</div>
          <div className="text-xs text-slate-400">Fleet Console</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-white">
            周
          </div>
          <div>
            <div className="text-sm font-medium text-white">调度主管</div>
            <div className="text-xs text-slate-400">周明 · 在线</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
