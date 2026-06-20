import { useMemo } from 'react';
import { Disposal } from '@/types';
import { Badge } from '@/components/UI/Badge';
import { useFleetStore } from '@/store/fleetStore';
import { MapPin, Clock } from 'lucide-react';
import {
  disposalActionLabels,
  incidentTypeLabels,
  formatDateTime,
} from '@/utils/formatters';

interface DisposalRecordProps {
  disposals: Disposal[];
}

export function DisposalRecord({ disposals }: DisposalRecordProps) {
  const vehicles = useFleetStore((s) => s.vehicles);
  const incidents = useFleetStore((s) => s.incidents);
  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);
  const incidentMap = useMemo(() => {
    const map = new Map();
    incidents.forEach((i) => map.set(i.id, i));
    return map;
  }, [incidents]);

  if (disposals.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">暂无处置记录</p>
      </div>
    );
  }

  const sortedDisposals = [...disposals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">车辆</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">异常类型</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">处置方式</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">处置说明</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">操作人</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">处置时间</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {sortedDisposals.map((d) => {
            const vehicle = vehicleMap.get(d.vehicleId);
            const incident = incidentMap.get(d.incidentId);
            return (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{vehicle?.plateNumber ?? '-'}</div>
                  <div className="text-xs text-slate-500">{vehicle?.driverName ?? ''}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                  {incident ? incidentTypeLabels[incident.type] : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant="info">{disposalActionLabels[d.action]}</Badge>
                </td>
                <td className="px-4 py-3">
                  {d.stationName && (
                    <div className="mb-1.5 flex items-center gap-2 text-xs text-emerald-600">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium">{d.stationName}</span>
                      {d.detourMinutes && (
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          绕行约{d.detourMinutes}分钟
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-slate-700 line-clamp-2 max-w-md">{d.note}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{d.operator}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                  {formatDateTime(d.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
