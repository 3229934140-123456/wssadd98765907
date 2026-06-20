import { useMemo } from 'react';
import { Bell, Search, Clock } from 'lucide-react';
import { useFleetStore } from '@/store/fleetStore';
import { useEffect, useState } from 'react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const incidents = useFleetStore((s) => s.incidents);
  const pendingCount = useMemo(
    () => incidents.filter((i) => i.status === 'pending').length,
    [incidents]
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span className="font-mono">
            {currentTime.toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索车牌、司机..."
            className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-600" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
