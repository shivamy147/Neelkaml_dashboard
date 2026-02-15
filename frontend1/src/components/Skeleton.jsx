import React from 'react';

// Base skeleton component
export const Skeleton = ({ className = "", width, height }) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
    />
  );
};

// Card skeleton for stats/metrics
export const StatCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="w-12 h-12 rounded-lg" />
    </div>
  </div>
);

// Store card skeleton
export const StoreCardSkeleton = () => (
  <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
    {/* Status Bar Skeleton */}
    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>

    {/* Store Info Skeleton */}
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-4 w-12 mb-1 mx-auto" />
            <Skeleton className="h-6 w-16 mx-auto" />
          </div>
        ))}
      </div>

      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

// Dashboard overview skeleton
export const DashboardOverviewSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

// Chart skeleton
export const ChartSkeleton = ({ height = "300px" }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
    <Skeleton className="h-6 w-48 mb-6" />
    <div className="flex items-end space-x-2 mb-4" style={{ height }}>
      {[...Array(8)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1"
          height={`${Math.random() * 60 + 40}%`}
        />
      ))}
    </div>
    <div className="flex justify-between">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-3 w-6" />
      ))}
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
    <div className="mt-6 flex gap-3">
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="border-b border-gray-200 p-4">
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex space-x-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Loading page skeleton - combines multiple skeletons
export const LoadingPageSkeleton = ({ showStats = true, showCharts = false, showTable = false }) => (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>

    {/* Stats Grid */}
    {showStats && <DashboardOverviewSkeleton />}

    {/* Charts */}
    {showCharts && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    )}

    {/* Table */}
    {showTable && <TableSkeleton />}
  </div>
);