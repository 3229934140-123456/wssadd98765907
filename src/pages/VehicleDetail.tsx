import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Fuel, Battery, ThermometerSnowflake, DoorOpen, Clock, MapPin, Package, User, AlertTriangle, History, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Badge } from '@/components/UI/Badge';
import { Button } from '@/components/UI/Button';
import { TempChart } from '@/components/UI/TempChart';
import { StrategyForm } from '@/components/Strategy/StrategyForm';
import { StrategyHistory } from '@/components/Strategy/StrategyHistory';
import { useFleetStore } from '@/store/fleetStore';
import {
  coolingSourceLabels,
  coolingSourceColors,
  doorStatusLabels,
  vehicleStatusLabels,
  formatTemperature,
  formatPercent,
} from '@/utils/formatters';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicles = useFleetStore((s) => s.vehicles);
  const allStrategies = useFleetStore((s) => s.strategies);
  const allIncidents = useFleetStore((s) => s.incidents);
  const [showStrategyForm, setShowStrategyForm] = useState(false);

  const vehicle = useMemo(() => vehicles.find((v) => v.id === id), [vehicles, id]);
  const strategies = useMemo(() =>
    allStrategies
      .filter((s) => s.vehicleId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allStrategies, id]
  );
  const incidents = useMemo(() =>
    allIncidents
      .filter((i) => i.vehicleId === id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [allIncidents, id]
  );
  const activeIncidents = useMemo(() => incidents.filter((i) => i.status !== 'resolved'), [incidents]);

  if (!vehicle) {
    return (
      <AppLayout title="车辆详情" subtitle="">
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-sm text-slate-500">车辆不存在</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/dashboard')}>
            返回总览
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusBadgeVariant = vehicle.status === 'running' ? 'success' : vehicle.status === 'warning' ? 'warning' : vehicle.status === 'error' ? 'danger' : 'default';
  const isTempWarning = vehicle.temperature > vehicle.targetTempMax || vehicle.temperature < vehicle.targetTempMin;

  return (
    <AppLayout title={`${vehicle.plateNumber} 详情`} subtitle={`${vehicle.driverName} · ${vehicle.route}`}>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
            返回总览
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{vehicle.plateNumber}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{vehicle.route}</p>
                </div>
                <Badge variant={statusBadgeVariant}>{vehicleStatusLabels[vehicle.status]}</Badge>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">司机信息</div>
                    <div className="text-sm font-medium text-slate-900">{vehicle.driverName}</div>
                    <div className="text-xs text-slate-500">{vehicle.driverPhone}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Package className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">货品类型</div>
                    <div className="text-sm font-medium text-slate-900">{vehicle.cargoType}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <MapPin className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">预计到仓</div>
                    <div className="text-sm font-medium text-slate-900">{vehicle.eta}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <span className={clsx('h-3 w-3 rounded-full', coolingSourceColors[vehicle.coolingSource])} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">当前制冷来源</div>
                    <div className="text-sm font-medium text-slate-900">{coolingSourceLabels[vehicle.coolingSource]}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <DoorOpen className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">门磁状态</div>
                    <div className={clsx('text-sm font-medium', vehicle.doorStatus === 'open' ? 'text-rose-600' : 'text-slate-900')}>
                      {doorStatusLabels[vehicle.doorStatus]}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Fuel className="h-4 w-4" />
                  油量
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{formatPercent(vehicle.fuelLevel)}</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={clsx('h-full rounded-full transition-all', vehicle.fuelLevel < 30 ? 'bg-rose-500' : 'bg-amber-500')}
                    style={{ width: `${vehicle.fuelLevel}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Battery className="h-4 w-4" />
                  电量
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{formatPercent(vehicle.batteryLevel)}</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={clsx('h-full rounded-full transition-all', vehicle.batteryLevel < 30 ? 'bg-rose-500' : 'bg-sky-500')}
                    style={{ width: `${vehicle.batteryLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {activeIncidents.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  <span className="text-sm font-medium text-rose-700">存在 {activeIncidents.length} 条待处理异常</span>
                </div>
                <Button variant="danger" size="sm" className="w-full" onClick={() => navigate('/incidents')}>
                  前往处理
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className={clsx('rounded-xl border p-5', isTempWarning ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-white')}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ThermometerSnowflake className={clsx('h-5 w-5', isTempWarning ? 'text-rose-600' : 'text-sky-600')} />
                    <h3 className="text-base font-semibold text-slate-900">车厢温度</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    目标温区：{formatTemperature(vehicle.targetTempMin)} ~ {formatTemperature(vehicle.targetTempMax)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={clsx('text-3xl font-semibold', isTempWarning ? 'text-rose-600' : 'text-slate-900')}>
                    {formatTemperature(vehicle.temperature)}
                  </div>
                  {isTempWarning && (
                    <Badge variant="danger" className="mt-1">温度异常</Badge>
                  )}
                </div>
              </div>
              <TempChart
                data={vehicle.tempHistory}
                targetMin={vehicle.targetTempMin}
                targetMax={vehicle.targetTempMax}
                height={200}
              />
              <div className="mt-2 flex items-center justify-end gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-emerald-500" />
                  <span className="text-slate-500">目标下限</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-rose-500" />
                  <span className="text-slate-500">目标上限</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-sky-500" />
                  <span className="text-slate-500">实际温度</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-sky-600" />
                  <h3 className="text-base font-semibold text-slate-900">联控策略</h3>
                </div>
                {!showStrategyForm && (
                  <Button size="sm" onClick={() => setShowStrategyForm(true)}>
                    下发新策略
                  </Button>
                )}
              </div>

              <div className="p-5">
                {showStrategyForm ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-slate-700">配置联控策略</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowStrategyForm(false)}>
                        取消
                      </Button>
                    </div>
                    <StrategyForm vehicleId={vehicle.id} onSuccess={() => setShowStrategyForm(false)} />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <History className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">策略执行历史</span>
                    </div>
                    <StrategyHistory strategies={strategies} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
