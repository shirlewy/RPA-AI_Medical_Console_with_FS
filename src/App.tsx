import { TopOverview } from './components/TopOverview';
import { AnomalyCenter } from './components/AnomalyCenter';
import { DepartmentMatrix } from './components/DepartmentMatrix';
import { DashboardCharts } from './components/DashboardCharts';
import { ActivitySquare, Bell, Settings, User } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 font-sans flex flex-col items-center pb-12">
      {/* Top Navbar */}
      <nav className="w-full h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center">
            <ActivitySquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-[14px] font-bold text-slate-800 tracking-tight">智能运营平台</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button className="hover:text-slate-800 transition-colors"><Bell className="w-4 h-4" /></button>
          <button className="hover:text-slate-800 transition-colors"><Settings className="w-4 h-4" /></button>
          <div className="w-7 h-7 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center ml-2">
            <User className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>
      </nav>

      <main className="w-full max-w-[1440px] px-6 pt-6 flex flex-col gap-6 flex-1">
         {/* Page Header */}
         <header className="flex justify-between items-end">
           <div>
             <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight">运营驾驶舱</h1>
             <p className="text-[12px] text-slate-500 mt-1">全局数字化编排与异常治理</p>
           </div>
           <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
              最后更新: 刚刚
              <button className="pl-3 py-1 border-l border-slate-300 text-blue-600 hover:text-blue-800">刷新</button>
           </div>
         </header>

         {/* Top Stats Layer */}
         <TopOverview />

         {/* Core Interaction Middle Layer */}
         <div className="grid grid-cols-12 gap-6">
           <div className="col-span-8 flex flex-col">
             <DashboardCharts />
           </div>
           <div className="col-span-4 flex flex-col h-[320px]">
             <AnomalyCenter />
           </div>
         </div>

         {/* Bottom Department Matrix Layer */}
         <div className="w-full">
           <DepartmentMatrix />
         </div>
      </main>
    </div>
  )
}


