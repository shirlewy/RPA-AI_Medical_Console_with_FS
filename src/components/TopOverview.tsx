import { Activity, Clock, Cpu, ShieldCheck, Zap, Network } from 'lucide-react';
import { cn } from '../lib/utils';

export function TopOverview() {
  const stats = [
    { label: '自动化健康度', value: '95', unit: '%', sub: '状态良好', icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', trend: 'Live', tooltip: '自动化健康度=流程成功率×35%+异常自愈率×25%+在线流程占比×20%+响应效率得分×10%+AI增强流程占比×10%' },
    { label: '自动化节省工时', value: '142.5', unit: 'h', sub: '较昨日 +12%', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: '在线自动化节点', value: '42', unit: '个', sub: '覆盖 5 大业务域', icon: Network, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    { label: '流程稳定交付率', value: '99.8', unit: '%', sub: '3,842 次任务执行', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'AI增强流程占比', value: '41.2', unit: '%', sub: '调用模型 1.5w 次', icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', tooltip: 'AI 增强流程占比计算公式=AI参与流程/总流程数' },
    { label: '异常自愈率', value: '88', unit: '%', sub: '今日自动恢复：24 / 27', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm hover:shadow-md transition-shadow shrink-0 min-w-0">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="text-[12px] font-medium text-slate-500 truncate">{stat.label}</div>
            <div className={cn("w-6 h-6 shrink-0 rounded-md flex items-center justify-center border relative", stat.tooltip && "group/icon cursor-help", stat.bg, stat.color, stat.border)}>
              <stat.icon className="w-3.5 h-3.5" />
              {stat.tooltip && (
                <div className="absolute right-0 top-full mt-2 w-max max-w-[250px] px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-medium rounded shadow-lg opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all z-50">
                  {stat.tooltip}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-end gap-1 mb-1.5 flex-wrap">
            <div className="text-2xl font-semibold text-slate-800 leading-none tracking-tight">{stat.value}</div>
            {stat.unit && <div className="text-[13px] font-medium text-slate-400 mb-0.5">{stat.unit}</div>}
             {stat.trend === 'Live' && (
              <span className="ml-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-[9px] font-semibold text-teal-600">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                ON
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 truncate">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
