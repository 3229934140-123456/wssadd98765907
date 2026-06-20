import { useState } from 'react';
import { AlertTriangle, FileCheck, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { AppLayout } from '@/components/Layout/AppLayout';
import { IncidentList } from '@/components/Incident/IncidentList';
import { IncidentDrawer } from '@/components/Incident/IncidentDrawer';
import { DisposalRecord } from '@/components/Incident/DisposalRecord';
import { useFleetStore } from '@/store/fleetStore';
import { Incident, IncidentStatus } from '@/types';

type TabType = 'pending' | 'history';
type StatusFilter = 'all' | IncidentStatus;

export default function Incidents() {
  const incidents = useFleetStore((s) => s.incidents);
  const disposals = useFleetStore((s) => s.disposals);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const pendingCount = incidents.filter((i) => i.status !== 'resolved').length;

  const filteredIncidents = incidents
    .filter((i) => activeTab === 'pending' ? i.status !== 'resolved' : true)
    .filter((i) => statusFilter === 'all' ? true : i.status === statusFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <AppLayout title="异常处理" subtitle="处置温度超限、设备故障和能耗异常事件">
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === 'pending' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <AlertTriangle className="h-4 w-4" />
                待处理异常
                {pendingCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === 'history' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <FileCheck className="h-4 w-4" />
                处置记录
              </button>
            </div>

            {activeTab === 'pending' && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待处理</option>
                  <option value="processing">处理中</option>
                  <option value="resolved">已解决</option>
                </select>
              </div>
            )}
          </div>

          <div className="p-4">
            {activeTab === 'pending' ? (
              <IncidentList incidents={filteredIncidents} onHandle={setSelectedIncident} />
            ) : (
              <DisposalRecord disposals={disposals} />
            )}
          </div>
        </div>
      </div>

      <IncidentDrawer incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
    </AppLayout>
  );
}
