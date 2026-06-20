export type CoolingSource = 'engine' | 'battery' | 'hybrid' | 'off';
export type DoorStatus = 'closed' | 'open' | 'unknown';
export type VehicleStatus = 'running' | 'idle' | 'warning' | 'error' | 'offline';
export type StrategyType = 'fuel_save' | 'thermal_first' | 'precool_before_arrival';
export type StrategyStatus = 'pending' | 'active' | 'completed' | 'failed';
export type IncidentType = 'temp_high' | 'engine_fail' | 'battery_low' | 'door_open' | 'other';
export type IncidentLevel = 'critical' | 'warning' | 'info';
export type IncidentStatus = 'pending' | 'processing' | 'resolved';
export type DisposalAction = 'call_driver' | 'reroute_station' | 'stop_and_check' | 'other';

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  route: string;
  cargoType: string;
  coolingSource: CoolingSource;
  fuelLevel: number;
  batteryLevel: number;
  temperature: number;
  targetTempMin: number;
  targetTempMax: number;
  doorStatus: DoorStatus;
  eta: string;
  status: VehicleStatus;
  tempHistory: { time: string; value: number }[];
}

export interface Strategy {
  id: string;
  vehicleId: string;
  type: StrategyType;
  targetTempMin: number;
  targetTempMax: number;
  startTime: string;
  endTime: string;
  status: StrategyStatus;
  createdAt: string;
}

export interface Incident {
  id: string;
  vehicleId: string;
  type: IncidentType;
  level: IncidentLevel;
  description: string;
  timestamp: string;
  status: IncidentStatus;
}

export interface ChargingStation {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  detourMinutes: number;
  type: 'charging' | 'fuel' | 'both';
  available: boolean;
}

export interface Disposal {
  id: string;
  incidentId: string;
  vehicleId: string;
  action: DisposalAction;
  note: string;
  operator: string;
  createdAt: string;
  stationId?: string;
  stationName?: string;
  detourMinutes?: number;
}

export interface VehicleFilters {
  route: string;
  cargoType: string;
  driverName: string;
}
