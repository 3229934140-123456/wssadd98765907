import { useNavigate } from 'react-router-dom';
import { Fuel, Battery, ThermometerSnowflake, DoorOpen, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Vehicle } from '@/types';
import { Badge } from '@/components/UI/Badge';
import { StatusIndicator } from '@/components/UI/StatusIndicator';
import {
  coolingSourceLabels,
  coolingSourceColors,
  doorStatusLabels,
  vehicleStatusLabels,
  formatTemperature,
  formatPercent,
} from '@/utils/formatters';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const statusMap: Record<Vehicle['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  running: 'success',
  idle: 'neutral',
  warning: 'warning',
  error: 'danger',
  offline: 'neutral',
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const navigate = useNavigate();
  const isTempWarning = vehicle.temperature > vehicle.targetTempMax || vehicle.temperature < vehicle.targetTempMin;

  const borderClass = clsx(
    'rounded-xl border bg-white transition-all hover:shadow-md cursor-pointer',
    vehicle.status === 'error' && 'border-rose-300 ring-1 ring-rose-200',
    vehicle.status === 'warning' && 'border-amber-300',
    vehicle.status !== 'error' && vehicle.status !== 'warning' && 'border-slate-200 hover:border-slate-300'
  );

  return (
    <div
      className={borderClass}
      onClick={() => navigate(`/vehicle/${vehicle.id}`)}
    >
      <div className="flex items-start justify-between border-b border-slate-100 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{vehicle.plateNumber}</h3>
            <Badge variant={vehicle.status === 'running' ? 'success' : vehicle.status === 'warning' ? 'warning' : vehicle.status === 'error' ? 'danger' : 'default'}>
              {vehicleStatusLabels[vehicle.status]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {vehicle.driverName} · {vehicle.route}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">货品类型</span>
          <Badge variant="info">{vehicle.cargoType}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={clsx('h-2 w-2 rounded-full', coolingSourceColors[vehicle.coolingSource])} />
            制冷来源
          </div>
          <span className="text-xs font-medium text-slate-700">{coolingSourceLabels[vehicle.coolingSource]}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-slate-50 p-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Fuel className="h-3.5 w-3.5" />
              油量
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <span className="text-lg font-semibold text-slate-900">{formatPercent(vehicle.fuelLevel)}</span>
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={clsx('h-full rounded-full', vehicle.fuelLevel < 30 ? 'bg-rose-500' : 'bg-amber-500')}
                  style={{ width: `${vehicle.fuelLevel}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Battery className="h-3.5 w-3.5" />
              电量
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <span className="text-lg font-semibold text-slate-900">{formatPercent(vehicle.batteryLevel)}</span>
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={clsx('h-full rounded-full', vehicle.batteryLevel < 30 ? 'bg-rose-500' : 'bg-sky-500')}
                  style={{ width: `${vehicle.batteryLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={clsx('rounded-lg p-2.5', isTempWarning ? 'bg-rose-50' : 'bg-slate-50')}>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <ThermometerSnowflake className={clsx('h-3.5 w-3.5', isTempWarning && 'text-rose-500')} />
            车厢温度
            {isTempWarning && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
          </div>
          <div className="mt-1.5 flex items-end justify-between">
            <span className={clsx('text-lg font-semibold', isTempWarning ? 'text-rose-600' : 'text-slate-900')}>
              {formatTemperature(vehicle.temperature)}
            </span>
            <span className="text-xs text-slate-500">
              目标 {formatTemperature(vehicle.targetTempMin)} ~ {formatTemperature(vehicle.targetTempMax)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <DoorOpen className="h-3.5 w-3.5" />
            <span className={clsx(vehicle.doorStatus === 'open' && 'text-rose-600 font-medium')}>
              {doorStatusLabels[vehicle.doorStatus]}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            预计到仓 <span className="font-medium text-slate-700">{vehicle.eta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
