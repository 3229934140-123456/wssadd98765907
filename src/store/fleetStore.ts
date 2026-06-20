import { create } from 'zustand';
import { Vehicle, Strategy, Incident, Disposal, VehicleFilters, StrategyType, DisposalAction } from '@/types';
import { mockVehicles, mockStrategies, mockIncidents, mockDisposals } from '@/data/mockData';

interface FleetState {
  vehicles: Vehicle[];
  strategies: Strategy[];
  incidents: Incident[];
  disposals: Disposal[];
  filters: VehicleFilters;
  setFilters: (filters: Partial<VehicleFilters>) => void;
  resetFilters: () => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getStrategiesByVehicleId: (vehicleId: string) => Strategy[];
  getIncidentsByVehicleId: (vehicleId: string) => Incident[];
  getDisposalsByIncidentId: (incidentId: string) => Disposal[];
  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'status'>) => void;
  addDisposal: (disposal: Omit<Disposal, 'id' | 'createdAt' | 'operator'>) => void;
  updateIncidentStatus: (incidentId: string, status: Incident['status']) => void;
  getFilteredVehicles: () => Vehicle[];
  getStats: () => { total: number; running: number; warning: number; error: number; offline: number };
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: mockVehicles,
  strategies: mockStrategies,
  incidents: mockIncidents,
  disposals: mockDisposals,
  filters: { route: '', cargoType: '', driverName: '' },

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  resetFilters: () =>
    set({ filters: { route: '', cargoType: '', driverName: '' } }),

  getVehicleById: (id) => get().vehicles.find((v) => v.id === id),

  getStrategiesByVehicleId: (vehicleId) =>
    get()
      .strategies.filter((s) => s.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  getIncidentsByVehicleId: (vehicleId) =>
    get()
      .incidents.filter((i) => i.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

  getDisposalsByIncidentId: (incidentId) =>
    get()
      .disposals.filter((d) => d.incidentId === incidentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  addStrategy: (strategy) => {
    const newStrategy: Strategy = {
      ...strategy,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    set((state) => ({ strategies: [...state.strategies, newStrategy] }));
  },

  addDisposal: (disposal) => {
    const newDisposal: Disposal = {
      ...disposal,
      id: `d${Date.now()}`,
      createdAt: new Date().toISOString(),
      operator: '调度主管-周明',
    };
    set((state) => ({ disposals: [...state.disposals, newDisposal] }));
  },

  updateIncidentStatus: (incidentId, status) =>
    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === incidentId ? { ...i, status } : i
      ),
    })),

  getFilteredVehicles: () => {
    const { vehicles, filters } = get();
    return vehicles.filter((v) => {
      if (filters.route && !v.route.includes(filters.route)) return false;
      if (filters.cargoType && v.cargoType !== filters.cargoType) return false;
      if (filters.driverName && !v.driverName.includes(filters.driverName)) return false;
      return true;
    });
  },

  getStats: () => {
    const { vehicles } = get();
    return {
      total: vehicles.length,
      running: vehicles.filter((v) => v.status === 'running').length,
      warning: vehicles.filter((v) => v.status === 'warning').length,
      error: vehicles.filter((v) => v.status === 'error').length,
      offline: vehicles.filter((v) => v.status === 'offline').length,
    };
  },
}));

export type { StrategyType, DisposalAction };
