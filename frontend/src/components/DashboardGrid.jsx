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

const DashboardGrid = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue" value="$ 1.29M" trend="12.5%" isUp={true} icon={DollarSign} delay={0.1} />
        <KpiCard title="Growth Rate" value="12.5%" trend="2.1%" isUp={true} icon={Activity} delay={0.2} />
        <KpiCard title="Avg Order" value="$ 432" trend="0.5%" isUp={false} icon={TrendingUp} delay={0.3} />
        <KpiCard title="Active Regions" value="12" subValue="Across 4 Zones" icon={MapPin} delay={0.4} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
           <ChartCard 
             type="line" 
             title="Revenue Over Time" 
             data={revenueData} 
             dataKey="revenue" 
             xAxisKey="name" 
             delay={0.5}
           />
        </div>
        <div className="lg:col-span-4">
           <ChartCard 
             type="pie" 
             title="Revenue by Category" 
             data={productData} 
             dataKey="sales" 
             xAxisKey="name" 
             delay={0.6}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
           <ChartCard 
             type="bar" 
             title="Region Distribution" 
             data={regionData} 
             dataKey="value" 
             xAxisKey="name" 
             delay={0.7}
             height={200}
           />
        </div>
        <div className="lg:col-span-8">
           <div className="card-base p-5 h-full">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Model Inferences</h3>
              <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <p className="text-[13px] text-slate-600 font-medium">Anomaly detected in North region sales for the last 48 hours.</p>
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
