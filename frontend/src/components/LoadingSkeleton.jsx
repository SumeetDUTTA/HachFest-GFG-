import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="space-y-12 animate-pulse">
      {/* KPI Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-44 bg-slate-200/50 rounded-[2rem] border border-slate-100" />
        ))}
      </div>

      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-[430px] bg-slate-200/50 rounded-[2.5rem] border border-slate-100" />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
