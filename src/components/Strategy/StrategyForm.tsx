import { useState, useMemo } from 'react';
import { Snowflake, Leaf, Clock, Zap, AlertCircle, CheckCircle } from 'lucide-react';
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

interface ValidationErrors {
  tempRange?: string;
  timeRange?: string;
  general?: string;
}

export function StrategyForm({ vehicleId, onSuccess }: StrategyFormProps) {
  const addStrategy = useFleetStore((s) => s.addStrategy);
  const vehicles = useFleetStore((s) => s.vehicles);
  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId), [vehicles, vehicleId]);
  const [selectedType, setSelectedType] = useState<StrategyType>('fuel_save');
  const [targetTempMin, setTargetTempMin] = useState(vehicle?.targetTempMin ?? -20);
  const [targetTempMax, setTargetTempMax] = useState(vehicle?.targetTempMax ?? -15);
  const [startOffset, setStartOffset] = useState(0);
  const [endOffset, setEndOffset] = useState(4);
  const [showSuccess, setShowSuccess] = useState(false);

  const errors = useMemo<ValidationErrors>(() => {
    const errs: ValidationErrors = {};

    if (targetTempMin >= targetTempMax) {
      errs.tempRange = '下限温度必须低于上限温度';
    }

    const tempDiff = targetTempMax - targetTempMin;
    if (tempDiff < 1) {
      errs.tempRange = '温区间隔过小，至少需要 1°C 的缓冲范围';
    }
    if (tempDiff > 20) {
      errs.tempRange = '温区间隔过大，建议控制在 20°C 以内';
    }

    if (startOffset >= endOffset) {
      errs.timeRange = '开始时间必须早于结束时间';
    }

    if (endOffset - startOffset < 0.5) {
      errs.timeRange = '生效时段太短，建议至少 30 分钟';
    }

    if (endOffset > 48) {
      errs.timeRange = '生效时段不能超过 48 小时';
    }

    if (selectedType === 'precool_before_arrival') {
      if (endOffset - startOffset > 4) {
        errs.timeRange = '到仓前预冷策略建议不超过 4 小时';
      }
    }

    if (selectedType === 'fuel_save') {
      if (tempDiff < 3) {
        errs.tempRange = '省油模式下建议适当放宽温区间隔（≥3°C）';
      }
    }

    if (selectedType === 'thermal_first') {
      if (tempDiff > 5) {
        errs.tempRange = '保温优先模式下建议收窄温区间隔（≤5°C）';
      }
    }

    return errs;
  }, [targetTempMin, targetTempMax, startOffset, endOffset, selectedType]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;

    const now = Date.now();
    addStrategy({
      vehicleId,
      type: selectedType,
      targetTempMin,
      targetTempMax,
      startTime: new Date(now + startOffset * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now + endOffset * 60 * 60 * 1000).toISOString(),
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    onSuccess?.();
  };

  const accentClasses: Record<string, string> = {
    emerald: 'ring-emerald-500 bg-emerald-50 border-emerald-200',
    sky: 'ring-sky-500 bg-sky-50 border-sky-200',
    violet: 'ring-violet-500 bg-violet-50 border-violet-200',
  };

  const tempWarning = (min: number, max: number, type: StrategyType): string | null => {
    const diff = max - min;
    if (type === 'fuel_save' && diff < 3) return '建议放宽温区以节省燃油';
    if (type === 'thermal_first' && diff > 5) return '建议收窄温区以保证保温效果';
    if (type === 'precool_before_arrival' && min > -10) return '预冷温度建议设置较低';
    return null;
  };

  const tempTip = tempWarning(targetTempMin, targetTempMax, selectedType);

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
              className={clsx(
                'h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2',
                errors.tempRange
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
              )}
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
              className={clsx(
                'h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2',
                errors.tempRange
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
              )}
            />
          </div>
        </div>
        {errors.tempRange && (
          <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.tempRange}
          </p>
        )}
        {!errors.tempRange && tempTip && (
          <p className="mt-2 text-xs text-amber-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {tempTip}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">生效时段</label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">开始时间（从现在起小时后）</label>
            <input
              type="number"
              min="0"
              max="48"
              step="0.5"
              value={startOffset}
              onChange={(e) => setStartOffset(Number(e.target.value))}
              className={clsx(
                'h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2',
                errors.timeRange
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
              )}
            />
          </div>
          <span className="text-slate-400 mt-5">至</span>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">结束时间（从现在起小时后）</label>
            <input
              type="number"
              min="0"
              max="48"
              step="0.5"
              value={endOffset}
              onChange={(e) => setEndOffset(Number(e.target.value))}
              className={clsx(
                'h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2',
                errors.timeRange
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-sky-500 focus:ring-sky-500/20'
              )}
            />
          </div>
        </div>
        {errors.timeRange && (
          <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.timeRange}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          生效时长约 {(endOffset - startOffset).toFixed(1)} 小时
        </p>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span>策略已成功下发，正在推送到车辆终端...</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" size="md" disabled={hasErrors}>
          {hasErrors ? '请修正表单错误' : '确认下发策略'}
        </Button>
      </div>
    </form>
  );
}
