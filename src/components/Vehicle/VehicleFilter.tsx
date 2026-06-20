import { Filter, RotateCcw, MapPin, Package, User } from 'lucide-react';
import { useFleetStore } from '@/store/fleetStore';
import { routes, cargoTypes } from '@/data/mockData';
import { Button } from '@/components/UI/Button';

export function VehicleFilter() {
  const filters = useFleetStore((s) => s.filters);
  const setFilters = useFleetStore((s) => s.setFilters);
  const resetFilters = useFleetStore((s) => s.resetFilters);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4" />
          筛选条件
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.route}
              onChange={(e) => setFilters({ route: e.target.value })}
              className="h-9 w-44 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">全部线路</option>
              {routes.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.cargoType}
              onChange={(e) => setFilters({ cargoType: e.target.value })}
              className="h-9 w-40 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">全部货品</option>
              {cargoTypes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索司机姓名"
              value={filters.driverName}
              onChange={(e) => setFilters({ driverName: e.target.value })}
              className="h-9 w-40 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4" />
          重置
        </Button>
      </div>
    </div>
  );
}
