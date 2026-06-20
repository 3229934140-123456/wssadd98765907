import { useMemo } from 'react';
import { Truck, Activity, AlertTriangle, XCircle, WifiOff } from 'lucide-react';
import { useFleetStore } from '@/store/fleetStore';

export function VehicleStats() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const stats = useMemo(() => ({
    total: vehicles.length,
    running: vehicles.filter((v) => v.status === 'running').length,
    warning: vehicles.filter((v) => v.status === 'warning').length,
    error: vehicles.filter((v) => v.status === 'error').length,
    offline: vehicles.filter((v) => v.status === 'offline').length,
  }), [vehicles]);

  const statItems = [
    {
      label: '车辆总数',
      value: stats.total,
      icon: Truck,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      label: '运行中',
      value: stats.running,
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: '预警',
      value: stats.warning,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: '故障',
      value: stats.error,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      label: '离线',
      value: stats.offline,
      icon: WifiOff,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map(({ label, value, icon: Icon, color, bgColor }) => (
        <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
