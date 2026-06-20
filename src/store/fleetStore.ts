import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Vehicle, Strategy, Incident, Disposal, VehicleFilters, StrategyType, DisposalAction, ChargingStation } from '@/types';
import { mockVehicles, mockStrategies, mockIncidents, mockDisposals, getStationsByRoute } from '@/data/mockData';

interface FleetState {
  vehicles: Vehicle[];
  strategies: Strategy[];
  incidents: Incident[];
  disposals: Disposal[];
  filters: VehicleFilters;
  lastIncidentCheck: string | null;
  setFilters: (filters: Partial<VehicleFilters>) => void;
  resetFilters: () => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getStrategiesByVehicleId: (vehicleId: string) => Strategy[];
  getIncidentsByVehicleId: (vehicleId: string) => Incident[];
  getDisposalsByIncidentId: (incidentId: string) => Disposal[];
  getStationsByVehicleId: (vehicleId: string) => ChargingStation[];
  addStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'status'>) => void;
  addDisposal: (disposal: Omit<Disposal, 'id' | 'createdAt' | 'operator'> & { stationId?: string; stationName?: string; detourMinutes?: number }) => void;
  updateIncidentStatus: (incidentId: string, status: Incident['status']) => void;
  setLastIncidentCheck: (time: string) => void;
  getPendingIncidents: () => Incident[];
}

export const useFleetStore = create<FleetState>()(
  persist(
    (set, get) => ({
      vehicles: mockVehicles,
      strategies: mockStrategies,
      incidents: mockIncidents,
      disposals: mockDisposals,
      filters: { route: '', cargoType: '', driverName: '' },
      lastIncidentCheck: null,

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

      getStationsByVehicleId: (vehicleId) => {
        const vehicle = get().vehicles.find((v) => v.id === vehicleId);
        if (!vehicle) return [];
        return getStationsByRoute(vehicle.route);
      },

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

      setLastIncidentCheck: (time) => set({ lastIncidentCheck: time }),

      getPendingIncidents: () =>
        get().incidents.filter((i) => i.status === 'pending'),
    }),
    {
      name: 'fleet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        strategies: state.strategies,
        incidents: state.incidents,
        disposals: state.disposals,
        lastIncidentCheck: state.lastIncidentCheck,
      }),
    }
  )
);

export type { StrategyType, DisposalAction };
