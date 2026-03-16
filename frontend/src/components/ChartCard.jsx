import React from 'react';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  ScatterChart, Scatter,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3B82F6', '#818CF8', '#6366F1', '#A5B4FC', '#C7D2FE'];

const ChartCard = ({ type, title, data, dataKey, xAxisKey, delay, height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        className="card-base p-5"
      >
        <h3 className="text-[14px] font-semibold text-[#111827] mb-4">{title}</h3>
        <div className="h-[200px] w-full border border-dashed border-[#E5E7EB] rounded-lg flex items-center justify-center text-[13px] text-[#6B7280]">
          No data available for this visualization.
        </div>
      </motion.div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '12px' }} />
            <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
            <Bar dataKey={dataKey} fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey={dataKey}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <YAxis dataKey={dataKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
            <Scatter data={data} fill="#3B82F6" />
          </ScatterChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '12px' }} />
            <Area type="monotone" dataKey={dataKey} stroke="#3B82F6" fill="#DBEAFE" strokeWidth={2} />
          </AreaChart>
        );
      case 'table':
        return (
          <div className="h-full overflow-auto border border-[#E5E7EB] rounded-lg">
            <table className="w-full border-collapse text-[12px]">
              <thead className="bg-[#F8FAFC] sticky top-0">
                <tr>
                  {Object.keys(data[0]).map((col) => (
                    <th key={col} className="text-left px-3 py-2 font-semibold text-[#374151] border-b border-[#E5E7EB]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-[#FCFCFD]">
                    {Object.keys(row).map((col) => (
                      <td key={`${idx}-${col}`} className="px-3 py-2 border-b border-[#F3F4F6] text-[#4B5563]">{String(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default: return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="card-base p-5"
    >
      <h3 className="text-[14px] font-semibold text-[#111827] mb-4">{title}</h3>
      <div style={{ height: `${height}px` }} className="w-full">
        {type === 'table' ? (
          renderChart()
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default ChartCard;
