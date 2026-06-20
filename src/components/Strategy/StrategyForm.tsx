import { useState, useMemo } from 'react';
import { Snowflake, Leaf, Clock, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { StrategyType } from '@/types';
import { Button } from '@/components/UI/Button';
import { useFleetStore } from '@/store/fleetStore';
import {
  strategyTypeLabels,
  strategyTypeDescriptions,
} from '@/utils/formatters';

interface StrategyFormProps {
  vehicleId: string;
  onSuccess?: () => void;
}

const strategyOptions: { type: StrategyType; icon: typeof Snowflake; accent: string }[] = [
  { type: 'fuel_save', icon: Leaf, accent: 'emerald' },
  { type: 'thermal_first', icon: Snowflake, accent: 'sky' },
  { type: 'precool_before_arrival', icon: Clock, accent: 'violet' },
];

export function StrategyForm({ vehicleId, onSuccess }: StrategyFormProps) {
  const addStrategy = useFleetStore((s) => s.addStrategy);
  const vehicles = useFleetStore((s) => s.vehicles);
  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicles, vehicleId]);
  const [selectedType, setSelectedType] = useState<StrategyType>('fuel_save');
  const [targetTempMin, setTargetTempMin] = useState(vehicle?.targetTempMin ?? -20);
  const [targetTempMax, setTargetTempMax] = useState(vehicle?.targetTempMax ?? -15);
  const [startOffset, setStartOffset] = useState(0);
  const [endOffset, setEndOffset] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    addStrategy({
      vehicleId,
      type: selectedType,
      targetTempMin,
      targetTempMax,
      startTime: new Date(now + startOffset * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now + endOffset * 60 * 60 * 1000).toISOString(),
    });
    onSuccess?.();
  };

  const accentClasses: Record<string, string> = {
    emerald: 'ring-emerald-500 bg-emerald-50 border-emerald-200',
    sky: 'ring-sky-500 bg-sky-50 border-sky-200',
    violet: 'ring-violet-500 bg-violet-50 border-violet-200',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">选择联控策略</label>
        <div className="grid grid-cols-3 gap-3">
          {strategyOptions.map(({ type, icon: Icon, accent }) => {
            const selected = selectedType === type;
            return (
              <button
                type="button"
                key={type}
                onClick={() => setSelectedType(type)}
                className={clsx(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all',
                  selected
                    ? accentClasses[accent] + ' ring-2'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <div className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  selected ? `bg-${accent}-500/20 text-${accent}-600` : 'bg-slate-100 text-slate-500'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="w-full">
                  <div className={clsx('text-sm font-medium', selected ? 'text-slate-900' : 'text-slate-700')}>
                    {strategyTypeLabels[type]}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                    {strategyTypeDescriptions[type]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">目标温区 (°C)</label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">下限温度</label>
            <input
              type="number"
              step="0.5"
              value={targetTempMin}
              onChange={(e) => setTargetTempMin(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <Zap className="h-4 w-4 text-slate-400 mt-5" />
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">上限温度</label>
            <input
              type="number"
              step="0.5"
              value={targetTempMax}
              onChange={(e) => setTargetTempMax(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">生效时段</label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">开始时间（从现在起小时后）</label>
            <input
              type="number"
              min="0"
              max="24"
              value={startOffset}
              onChange={(e) => setStartOffset(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <span className="text-slate-400 mt-5">至</span>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">结束时间（从现在起小时后）</label>
            <input
              type="number"
              min="0"
              max="48"
              value={endOffset}
              onChange={(e) => setEndOffset(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" size="md">
          确认下发策略
        </Button>
      </div>
    </form>
  );
}
