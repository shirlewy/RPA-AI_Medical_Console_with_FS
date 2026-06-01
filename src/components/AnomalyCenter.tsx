import { AlertCircle, FileText, ActivitySquare, CheckCircle2, RotateCcw, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

const initialAnomalies = [
  { id: 1, title: 'WMS 冷链出库单 OCR 识别置信度低', dept: '仓储物流', risk: '中', scope: '影响 12 笔出库', aiMsg: '调用大模型二次校验，已修正批号信息模糊点并放行。', status: 'resolved', time: '2 mins ago' },
  { id: 2, title: '药监平台网络接口连接超时', dept: '质量合规', risk: '高', scope: '数据积压 45 条', aiMsg: '已自动切换备用链路，并执行指数退避重试，剩余积压 12 条。', status: 'recovering', time: '15 mins ago' },
  { id: 3, title: '财务共享中心对账金额不匹配', dept: '营销财务', risk: '高', scope: '涉及发票 3 张', aiMsg: '发现折扣扣留字段缺失，已建议 RPA 抓取补充数据并挂起任务。', status: 'pending', time: '34 mins ago' },
];

export function AnomalyCenter() {
  const [anomalies, setAnomalies] = useState(initialAnomalies);

  return (
    <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
          <ActivitySquare className="w-4 h-4 text-rose-500" />
          实时异常干预中心
        </h3>
        <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 rounded-full">3 Active</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
        <AnimatePresence>
          {anomalies.map((an) => (
            <motion.div key={an.id} className="border border-slate-100 rounded-lg p-3 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-colors group">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {an.status === 'resolved' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {an.status === 'recovering' && <RotateCcw className="w-4 h-4 text-amber-500 animate-[spin_3s_linear_infinite]" />}
                    {an.status === 'pending' && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 leading-tight">{an.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {an.dept}</span>
                      <span>•</span>
                      <span>{an.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pl-6 flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium border", 
                    an.risk === '高' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>风险: {an.risk}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium border bg-slate-50 text-slate-600 border-slate-100">
                    {an.scope}
                  </span>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100/50 rounded flex items-start gap-1.5 p-2 mt-1">
                   <div className="text-[10px] font-bold text-blue-600 shrink-0 mt-px">AI 动作:</div>
                   <div className="text-[11px] font-medium text-slate-600 leading-snug">{an.aiMsg}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-center">
        <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700">查看历史日志 →</button>
      </div>
    </div>
  );
}
