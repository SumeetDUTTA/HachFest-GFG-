import React from 'react';
import ChartCard from './ChartCard';
import KpiCard from './KpiCard';
import { 
  BarChart3,
  Database,
  Activity,
  Clock
} from 'lucide-react';

const DashboardGrid = ({ isVisible, response, title }) => {
  if (!isVisible) return null;

  const metadata = response?.metadata || {};
  const data = response?.data || [];
  const columns = metadata.columns || (data[0] ? Object.keys(data[0]) : []);

  const kpis = [
    {
      title: 'Rows Returned',
      value: String(metadata.row_count ?? data.length ?? 0),
      subValue: metadata.truncated ? 'Truncated by row cap' : 'Complete result set',
      icon: Database,
      delay: 0.1,
    },
    {
      title: 'Columns',
      value: String(columns.length),
      subValue: columns.length ? columns.slice(0, 2).join(' • ') : 'No columns',
      icon: Activity,
      delay: 0.2,
    },
    {
      title: 'Chart Type',
      value: (response?.chart_type || 'table').toUpperCase(),
      subValue: metadata.query_explanation || 'Auto-selected by model',
      icon: BarChart3,
      delay: 0.3,
    },
    {
      title: 'Cache',
      value: metadata.cache_hit ? 'Hit' : 'Fresh',
      subValue: metadata.cache_hit ? 'Served from memory cache' : 'Generated from source data',
      icon: Clock,
      delay: 0.4,
    },
  ];

  const chartConfig = response?.chart_config || {};
  const chartType = chartConfig.type || response?.chart_type || 'table';
  const chartData = chartConfig.data || data;
  const xAxisKey = chartConfig.xAxisDataKey || chartConfig.nameKey || columns[0];
  const yAxisKey = chartConfig.yAxisDataKey || chartConfig.dataKey || columns[1] || columns[0];
  const yAxisDataKeys = chartConfig.yAxisDataKeys || [yAxisKey];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((item) => (
          <KpiCard
            key={item.title}
            title={item.title}
            value={item.value}
            subValue={item.subValue}
            icon={item.icon}
            delay={item.delay}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-full">
           <ChartCard 
             type={chartType}
             title={chartConfig.title || title}
             data={chartData}
             dataKey={yAxisKey}
             dataKeys={yAxisDataKeys}
             xAxisKey={xAxisKey}
             delay={0.5}
           />
        </div>
        
        <div className="lg:col-span-4 h-full">
           <div className="card-base p-6 h-full flex flex-col bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#111827]">Analysis Insight</h3>
                </div>
                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-wider">
                  Verified
                </div>
             </div>
             
             <div className="space-y-4 flex-1">
                {(response?.insights || 'No additional insights were returned.').split('\n').filter(Boolean).map((line, idx) => (
                  <div key={idx} className="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100/80 hover:border-blue-200 transition-all duration-300">
                    <div className="flex gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-125 transition-transform" />
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                        {line.replace(/^-\s*/, '')}
                      </p>
                    </div>
                  </div>
                ))}
             </div>

             {metadata.visualization_notes?.length > 0 && (
               <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Model Footnotes</p>
                  <div className="space-y-1">
                    {metadata.visualization_notes.map((note, i) => (
                      <p key={i} className="text-[11px] text-slate-400 flex gap-2 italic">
                        <span>•</span> {note}
                      </p>
                    ))}
                  </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;
