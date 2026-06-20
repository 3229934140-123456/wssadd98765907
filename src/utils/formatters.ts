import { CoolingSource, DoorStatus, VehicleStatus, StrategyType, StrategyStatus, IncidentType, IncidentLevel, IncidentStatus, DisposalAction } from '@/types';

export const coolingSourceLabels: Record<CoolingSource, string> = {
  engine: '油机制冷',
  battery: '电机制冷',
  hybrid: '油电联动',
  off: '制冷关闭',
};

export const coolingSourceColors: Record<CoolingSource, string> = {
  engine: 'bg-amber-500',
  battery: 'bg-sky-500',
  hybrid: 'bg-emerald-500',
  off: 'bg-slate-500',
};

export const doorStatusLabels: Record<DoorStatus, string> = {
  closed: '车门关闭',
  open: '车门打开',
  unknown: '状态未知',
};

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  running: '运行中',
  idle: '怠速',
  warning: '预警',
  error: '故障',
  offline: '离线',
};

export const vehicleStatusColors: Record<VehicleStatus, string> = {
  running: 'bg-emerald-500',
  idle: 'bg-slate-400',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  offline: 'bg-slate-600',
};

export const strategyTypeLabels: Record<StrategyType, string> = {
  fuel_save: '优先省油',
  thermal_first: '优先保温',
  precool_before_arrival: '到仓前预冷',
};

export const strategyTypeDescriptions: Record<StrategyType, string> = {
  fuel_save: '在保证货物安全前提下，优先使用电机驱动制冷，降低油耗',
  thermal_first: '优先保证车厢温度稳定，允许油机高负荷运行',
  precool_before_arrival: '预计到仓前自动降低厢温，为卸货做准备',
};

export const strategyStatusLabels: Record<StrategyStatus, string> = {
  pending: '待生效',
  active: '执行中',
  completed: '已完成',
  failed: '执行失败',
};

export const incidentTypeLabels: Record<IncidentType, string> = {
  temp_high: '温度超上限',
  engine_fail: '油机启动失败',
  battery_low: '电量不足',
  door_open: '车门异常开启',
  other: '其他异常',
};

export const incidentLevelLabels: Record<IncidentLevel, string> = {
  critical: '严重',
  warning: '预警',
  info: '提示',
};

export const incidentLevelColors: Record<IncidentLevel, string> = {
  critical: 'bg-rose-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-sky-500 text-white',
};

export const incidentStatusLabels: Record<IncidentStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
};

export const disposalActionLabels: Record<DisposalAction, string> = {
  call_driver: '电话沟通',
  reroute_station: '改派补能点',
  stop_and_check: '停车检查',
  other: '其他处置',
};

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
