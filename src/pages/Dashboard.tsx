import { useMemo, useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { VehicleStats } from '@/components/Vehicle/VehicleStats';
import { VehicleFilter } from '@/components/Vehicle/VehicleFilter';
import { VehicleCard } from '@/components/Vehicle/VehicleCard';
import { IncidentDrawer } from '@/components/Incident/IncidentDrawer';
import { useFleetStore } from '@/store/fleetStore';
import { Incident } from '@/types';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import { incidentTypeLabels, incidentLevelColors, formatDateTime } from '@/utils/formatters';

export default function Dashboard() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const incidents = useFleetStore((s) => s.incidents);
  const lastIncidentCheck = useFleetStore((s) => s.lastIncidentCheck);
  const setLastIncidentCheck = useFleetStore((s) => s.setLastIncidentCheck);
  const filters = useFleetStore((s) => s.filters);

  const [showAlert, setShowAlert] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pendingIncidents = useMemo(
    () => incidents.filter((i) => i.status === 'pending'),
    [incidents]
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.route && !v.route.includes(filters.route)) return false;
      if (filters.cargoType && v.cargoType !== filters.cargoType) return false;
      if (filters.driverName && !v.driverName.includes(filters.driverName)) return false;
      return true;
    });
  }, [vehicles, filters]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  useEffect(() => {
    if (pendingIncidents.length > 0) {
      const lastCheck = lastIncidentCheck ? new Date(lastIncidentCheck) : null;
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      if (!lastCheck || lastCheck < fiveMinutesAgo) {
        setShowAlert(true);
      }
    }
  }, [pendingIncidents.length, lastIncidentCheck]);

  const handleHandle = (incident: Incident) => {
    setSelectedIncident(incident);
    setDrawerOpen(true);
    setShowAlert(false);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedIncident(null);
    setLastIncidentCheck(new Date().toISOString());
  };

  const handleDismissAlert = () => {
    setShowAlert(false);
    setLastIncidentCheck(new Date().toISOString());
  };

  return (
    <AppLayout title="车辆总览" subtitle="实时监控车队油机电、厢温和门磁状态">
      <div className="space-y-5">
        {showAlert && pendingIncidents.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-full bg-rose-100 p-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-rose-800">
                  待处理异常提醒（{pendingIncidents.length} 条）
                </h3>
                <p className="mt-1 text-xs text-rose-600">
                  检测到温度临近上限、油机故障或电量不足的待处理事件，请及时处置
                </p>
                <div className="mt-3 space-y-2">
                  {pendingIncidents.slice(0, 3).map((incident) => {
                    const vehicle = vehicleMap.get(incident.vehicleId);
                    return (
                      <button
                        key={incident.id}
                        onClick={() => handleHandle(incident)}
                        className="w-full flex items-center justify-between rounded-lg bg-white/70 p-3 text-left hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`inline-flex h-2 w-2 rounded-full ${incidentLevelColors[incident.level].replace('bg-', 'bg-').replace('text-', 'bg-')}`}></span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {vehicle?.plateNumber} · {incidentTypeLabels[incident.type]}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {incident.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={handleDismissAlert}
                    className="text-xs text-rose-500 hover:text-rose-700"
                  >
                    稍后处理
                  </button>
                  <button
                    onClick={() => {
                      if (pendingIncidents[0]) handleHandle(pendingIncidents[0]);
                    }}
                    className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors"
                  >
                    立即处置
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismissAlert}
                className="flex-shrink-0 rounded-md p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <VehicleStats />
        <VehicleFilter />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700">
              车辆列表 <span className="text-slate-400">({filteredVehicles.length})</span>
            </h2>
          </div>
          {filteredVehicles.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
              <p className="text-sm text-slate-500">没有符合筛选条件的车辆</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>

      <IncidentDrawer incident={selectedIncident} onClose={handleCloseDrawer} />
    </AppLayout>
  );
}
