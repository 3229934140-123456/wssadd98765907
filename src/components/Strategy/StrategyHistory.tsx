import { Clock, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Strategy } from '@/types';
import { Badge } from '@/components/UI/Badge';
import {
  strategyTypeLabels,
  strategyStatusLabels,
  formatDateTime,
  formatTemperature,
} from '@/utils/formatters';

interface StrategyHistoryProps {
  strategies: Strategy[];
}

const statusIcon = {
  pending: Clock,
  active: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

const statusVariant = {
  pending: 'default' as const,
  active: 'info' as const,
  completed: 'success' as const,
  failed: 'danger' as const,
};

export function StrategyHistory({ strategies }: StrategyHistoryProps) {
  if (strategies.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        暂无策略下发记录
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
      <ul className="space-y-4">
        {strategies.map((s) => {
          const Icon = statusIcon[s.status];
          return (
            <li key={s.id} className="relative pl-10">
              <div
                className={clsx(
                  'absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white',
                  s.status === 'active' && 'bg-sky-500',
                  s.status === 'completed' && 'bg-emerald-500',
                  s.status === 'pending' && 'bg-slate-400',
                  s.status === 'failed' && 'bg-rose-500'
                )}
              >
                <Icon className={clsx('h-3 w-3 text-white', s.status === 'active' && 'animate-spin')} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {strategyTypeLabels[s.type]}
                      </span>
                      <Badge variant={statusVariant[s.status]}>
                        {strategyStatusLabels[s.status]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      下发时间：{formatDateTime(s.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">目标温区：</span>
                    <span className="font-medium text-slate-700">
                      {formatTemperature(s.targetTempMin)} ~ {formatTemperature(s.targetTempMax)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">生效时段：</span>
                    <span className="font-medium text-slate-700">
                      {formatDateTime(s.startTime)} ~ {formatDateTime(s.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
