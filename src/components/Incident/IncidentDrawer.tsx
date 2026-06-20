import { useState, useMemo } from 'react';
import { X, Phone, MapPin, AlertOctagon, FileText, Clock, Navigation, Zap, Fuel } from 'lucide-react';
import { clsx } from 'clsx';
import { Incident, DisposalAction, ChargingStation } from '@/types';
import { Button } from '@/components/UI/Button';
import { Badge } from '@/components/UI/Badge';
import { useFleetStore } from '@/store/fleetStore';
import {
  incidentTypeLabels,
  incidentLevelLabels,
  incidentLevelColors,
  formatDateTime,
  disposalActionLabels,
} from '@/utils/formatters';

interface IncidentDrawerProps {
  incident: Incident | null;
  onClose: () => void;
}

const actionOptions: { action: DisposalAction; icon: typeof Phone; label: string }[] = [
  { action: 'call_driver', icon: Phone, label: '电话沟通' },
  { action: 'reroute_station', icon: MapPin, label: '改派补能点' },
  { action: 'stop_and_check', icon: AlertOctagon, label: '要求停车检查' },
  { action: 'other', icon: FileText, label: '其他处置' },
];

export function IncidentDrawer({ incident, onClose }: IncidentDrawerProps) {
  const addDisposal = useFleetStore((s) => s.addDisposal);
  const updateIncidentStatus = useFleetStore((s) => s.updateIncidentStatus);
  const vehicles = useFleetStore((s) => s.vehicles);
  const disposals = useFleetStore((s) => s.disposals);
  const getStationsByVehicleId = useFleetStore((s) => s.getStationsByVehicleId);

  const [selectedAction, setSelectedAction] = useState<DisposalAction>('call_driver');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [note, setNote] = useState('');

  const vehicle = useMemo(() => vehicles.find((v) => v.id === incident?.vehicleId), [vehicles, incident?.vehicleId]);

  const incidentDisposals = useMemo(() =>
    disposals
      .filter((d) => d.incidentId === incident?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [disposals, incident?.id]
  );

  const stations = useMemo(() => {
    if (!incident) return [];
    return getStationsByVehicleId(incident.vehicleId);
  }, [incident, getStationsByVehicleId]);

  const canSubmit = useMemo(() => {
    if (!note.trim()) return false;
    if (selectedAction === 'reroute_station' && !selectedStation) return false;
    return true;
  }, [note, selectedAction, selectedStation]);

  if (!incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    addDisposal({
      incidentId: incident.id,
      vehicleId: incident.vehicleId,
      action: selectedAction,
      note: note.trim(),
      stationId: selectedStation?.id,
      stationName: selectedStation?.name,
      detourMinutes: selectedStation?.detourMinutes,
    });
    updateIncidentStatus(incident.id, 'processing');
    setNote('');
    setSelectedStation(null);
    onClose();
  };

  const getStationTypeIcon = (type: ChargingStation['type']) => {
    if (type === 'both') {
      return (
        <div className="flex items-center gap-0.5">
          <Zap className="h-3 w-3" />
          <Fuel className="h-3 w-3" />
        </div>
      );
    }
    if (type === 'charging') return <Zap className="h-3.5 w-3.5" />;
    return <Fuel className="h-3.5 w-3.5" />;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">异常处置单</h2>
              <Badge className={incidentLevelColors[incident.level]}>
                {incidentLevelLabels[incident.level]}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {formatDateTime(incident.timestamp)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500 mb-1">异常类型</div>
            <div className="text-base font-medium text-slate-900">
              {incidentTypeLabels[incident.type]}
            </div>
            <div className="mt-3 text-xs text-slate-500 mb-1">异常描述</div>
            <div className="text-sm text-slate-700">{incident.description}</div>
            {vehicle && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500 mb-1">关联车辆</div>
                <div className="text-sm font-medium text-slate-900">{vehicle.plateNumber}</div>
                <div className="text-xs text-slate-500">
                  {vehicle.driverName} · {vehicle.route}
                </div>
              </div>
            )}
          </div>

          {incidentDisposals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">历史处置记录</h3>
              <div className="space-y-2">
                {incidentDisposals.map((d) => (
                  <div key={d.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="info">{disposalActionLabels[d.action]}</Badge>
                      <span className="text-xs text-slate-400">{formatDateTime(d.createdAt)}</span>
                    </div>
                    {d.stationName && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                        <MapPin className="h-3 w-3" />
                        <span>{d.stationName}</span>
                        {d.detourMinutes && (
                          <span className="text-slate-500">· 绕行约{d.detourMinutes}分钟</span>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-slate-700">{d.note}</p>
                    <p className="mt-2 text-xs text-slate-500">操作人：{d.operator}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">处置方式</label>
              <div className="grid grid-cols-2 gap-2">
                {actionOptions.map(({ action, icon: Icon, label }) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      setSelectedAction(action);
                      if (action !== 'reroute_station') setSelectedStation(null);
                    }}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all',
                      selectedAction === action
                        ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Icon className={clsx('h-4 w-4', selectedAction === action ? 'text-sky-600' : 'text-slate-400')} />
                    <span className={selectedAction === action ? 'font-medium text-slate-900' : 'text-slate-600'}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedAction === 'reroute_station' && (
              <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-3 space-y-2">
                <div className="text-xs font-medium text-sky-700 flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5" />
                  选择补能站点
                </div>
                <div className="space-y-2">
                  {stations.map((station) => (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => station.available && setSelectedStation(station)}
                      disabled={!station.available}
                      className={clsx(
                        'w-full text-left rounded-lg border p-3 transition-all',
                        !station.available && 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200',
                        station.available && selectedStation?.id === station.id
                          ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500'
                          : station.available
                            ? 'border-slate-200 bg-white hover:border-sky-300'
                            : ''
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                            <span className={clsx(
                              selectedStation?.id === station.id ? 'text-sky-700' : 'text-emerald-600'
                            )}>
                              {getStationTypeIcon(station.type)}
                            </span>
                            <span className="truncate">{station.name}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{station.location}</div>
                        </div>
                        {!station.available && (
                          <Badge variant="danger" className="flex-shrink-0">不可用</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {station.distanceKm}km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          绕行约{station.detourMinutes}分钟
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedAction === 'reroute_station' && !selectedStation && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" />
                    请选择一个补能站点
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                处置备注 <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="请填写沟通结果或处置说明..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                提交处置记录
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
