import { useMemo } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { VehicleStats } from '@/components/Vehicle/VehicleStats';
import { VehicleFilter } from '@/components/Vehicle/VehicleFilter';
import { VehicleCard } from '@/components/Vehicle/VehicleCard';
import { useFleetStore } from '@/store/fleetStore';

export default function Dashboard() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const filters = useFleetStore((s) => s.filters);
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.route && !v.route.includes(filters.route)) return false;
      if (filters.cargoType && v.cargoType !== filters.cargoType) return false;
      if (filters.driverName && !v.driverName.includes(filters.driverName)) return false;
      return true;
    });
  }, [vehicles, filters]);

  return (
    <AppLayout title="车辆总览" subtitle="实时监控车队油机电、厢温和门磁状态">
      <div className="space-y-5">
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
    </AppLayout>
  );
}
