import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { SquareActivity, PieChart as PieChartIcon } from "lucide-react";

// 提取原有的数值，以维持图表的趋势线
const baseValues = [
  { RPA: 3200, AI: 1240 },
  { RPA: 3400, AI: 1398 },
  { RPA: 3100, AI: 1800 },
  { RPA: 3800, AI: 2108 },
  { RPA: 3950, AI: 2800 },
  { RPA: 4100, AI: 3100 },
  { RPA: 4300, AI: 3400 },
];

// 动态生成包含最近 7 天日期的数组
const trendData = baseValues.map((item, index) => {
  const d = new Date();
  // 以今天为基准，依次计算 6 天前到今天的日期
  d.setDate(d.getDate() - (6 - index));

  // 格式化为 MM/DD，并补齐两位数
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return {
    date: `${month}/${day}`,
    ...item,
  };
});

const aiUsageData = [
  { name: "医药文献语义检索", value: 30 },
  { name: "门店动销分析预测", value: 25 },
  { name: "质检报告OCR解析", value: 20 },
  { name: "采购商品智能比价", value: 15 },
  { name: "销售数据字段映射", value: 10 },
];
const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#0ea5e9"];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 折线图趋势 */}
      <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col h-[320px] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2 relative group/title cursor-help w-max">
            <SquareActivity className="w-4 h-4 text-indigo-600" />
            自动化任务吞吐趋势 (7日)
            <div className="absolute left-0 top-full mt-2 w-max max-w-[280px] px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-medium rounded shadow-lg opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all z-50 font-normal tracking-normal text-left">
              最近7天，自动化平台处理任务数量的变化趋势。
            </div>
          </h3>
        </div>
        <div className="p-4 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRPA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                itemStyle={{ fontSize: "12px", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="RPA"
                stroke="#94a3b8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRPA)"
                name="基础 RPA 任务"
              />
              <Area
                type="monotone"
                dataKey="AI"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAI)"
                name="AI 增强任务"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 饼图分布 */}
      <div className="bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col h-[320px] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-teal-600" />
            AI 能力调用消耗分布
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            百万 Token / 次数
          </span>
        </div>
        <div className="p-4 flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={aiUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {aiUsageData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                itemStyle={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  color: "#475569",
                  fontWeight: 500,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
