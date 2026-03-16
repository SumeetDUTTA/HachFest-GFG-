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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
           <ChartCard 
             type={chartType}
             title={chartConfig.title || title}
             data={chartData}
             dataKey={yAxisKey}
             xAxisKey={xAxisKey}
             delay={0.5}
           />
        </div>
        <div className="lg:col-span-4">
           <div className="card-base p-5 h-full">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Model Insights</h3>
              <div className="space-y-3">
                 {(response?.insights || 'No additional insights were returned.').split('\n').filter(Boolean).map((line) => (
                   <div key={line} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <p className="text-[13px] text-slate-600 font-medium">{line.replace(/^-\s*/, '')}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;
