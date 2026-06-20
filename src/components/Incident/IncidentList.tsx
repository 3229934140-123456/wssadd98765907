import { useMemo } from 'react';
import { Incident } from '@/types';
import { Badge } from '@/components/UI/Badge';
import { Button } from '@/components/UI/Button';
import {
  incidentTypeLabels,
  incidentLevelLabels,
  incidentLevelColors,
  incidentStatusLabels,
  formatDateTime,
} from '@/utils/formatters';
import { useFleetStore } from '@/store/fleetStore';

interface IncidentListProps {
  incidents: Incident[];
  onHandle: (incident: Incident) => void;
}

const statusVariant = {
  pending: 'danger' as const,
  processing: 'warning' as const,
  resolved: 'success' as const,
};

export function IncidentList({ incidents, onHandle }: IncidentListProps) {
  const vehicles = useFleetStore((s) => s.vehicles);
  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">暂无异常事件</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">级别</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">异常类型</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">关联车辆</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">描述</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">时间</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">状态</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {incidents.map((incident) => {
            const vehicle = vehicleMap.get(incident.vehicleId);
            return (
              <tr key={incident.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge className={incidentLevelColors[incident.level]}>
                    {incidentLevelLabels[incident.level]}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                  {incidentTypeLabels[incident.type]}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{vehicle?.plateNumber ?? '-'}</div>
                  <div className="text-xs text-slate-500">{vehicle?.driverName ?? ''}</div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-700 line-clamp-2 max-w-xs">{incident.description}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                  {formatDateTime(incident.timestamp)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={statusVariant[incident.status]}>
                    {incidentStatusLabels[incident.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  {incident.status !== 'resolved' && (
                    <Button size="sm" variant={incident.status === 'pending' ? 'primary' : 'secondary'} onClick={() => onHandle(incident)}>
                      {incident.status === 'pending' ? '处理' : '继续处理'}
                    </Button>
                  )}
                  {incident.status === 'resolved' && (
                    <span className="text-xs text-slate-400">已关闭</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
