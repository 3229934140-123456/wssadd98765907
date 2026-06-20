import { useState, useMemo } from 'react';
import { X, Phone, MapPin, AlertOctagon, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { Incident, DisposalAction } from '@/types';
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

  const [selectedAction, setSelectedAction] = useState<DisposalAction>('call_driver');
  const [note, setNote] = useState('');

  const vehicle = useMemo(() => vehicles.find((v) => v.id === incident?.vehicleId), [vehicles, incident?.vehicleId]);
  const incidentDisposals = useMemo(() =>
    disposals
      .filter((d) => d.incidentId === incident?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [disposals, incident?.id]
  );

  if (!incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    addDisposal({
      incidentId: incident.id,
      vehicleId: incident.vehicleId,
      action: selectedAction,
      note: note.trim(),
    });
    updateIncidentStatus(incident.id, 'processing');
    setNote('');
    onClose();
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
                    onClick={() => setSelectedAction(action)}
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
              <Button type="submit" disabled={!note.trim()}>
                提交处置记录
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
