import React from 'react';
import ChartCard from './ChartCard';
import KpiCard from './KpiCard';
import { revenueData, regionData, productData } from '../data/mockData';
import { 
  DollarSign, 
  MapPin, 
  Activity,
  TrendingUp
} from 'lucide-react';

const DashboardGrid = ({ isVisible, data }) => {
  if (!isVisible || !data) return null;

  const { chart_config, chart_type, insights, metadata } = data;
  const chartData = data.data || [];

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Rows Processed" 
          value={metadata?.row_count || 0} 
          subValue="Total Records"
          icon={Activity} 
          delay={0.1} 
        />
        <KpiCard 
          title="Chart Type" 
          value={chart_type?.toUpperCase()} 
          subValue="Dynamic Selection"
          icon={TrendingUp} 
          delay={0.2} 
        />
        <KpiCard 
          title="Data Health" 
          value="100%" 
          trend="No Errors" 
          isUp={true} 
          icon={Activity} 
          delay={0.3} 
        />
        <KpiCard 
          title="Query Status" 
          value="Success" 
          subValue="Real-time" 
          icon={TrendingUp} 
          delay={0.4} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
           <ChartCard 
             type={chart_type} 
             title={data.title || "Visualization"} 
             data={chartData} 
             dataKey={chart_config?.yAxisKey || (chartData.length > 0 ? Object.keys(chartData[0]).find(k => k !== chart_config?.xAxisKey) : "")} 
             xAxisKey={chart_config?.xAxisKey || (chartData.length > 0 ? Object.keys(chartData[0])[0] : "")} 
             delay={0.5}
             height={400}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12">
           <div className="card-base p-5 h-full">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4 uppercase tracking-widest text-blue-600">Generated Insights</h3>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-[13px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  {insights}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;
