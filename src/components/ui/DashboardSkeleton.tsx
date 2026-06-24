import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="pb-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen pt-4 sm:pt-8 overflow-hidden">
      
      {/* 1. Header Skeleton */}
      <div className="flex justify-between items-end mb-8 relative">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-blue-100/80 animate-pulse rounded-lg"></div>
          <div className="h-4 w-48 bg-blue-50 animate-pulse rounded-md"></div>
        </div>
        <div className="hidden sm:block h-10 w-56 bg-blue-100/60 animate-pulse rounded-xl"></div>
      </div>

      {/* 2. Top Level Metrics (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative bg-white rounded-2xl p-6 border border-blue-50 shadow-sm overflow-hidden flex flex-col justify-between h-[120px]">
            <div 
              className="h-3 w-24 bg-blue-50 animate-pulse rounded-full" 
              style={{ animationDelay: `${i * 100}ms` }}
            ></div>
            <div 
              className="h-8 w-32 bg-blue-100/80 animate-pulse rounded-full" 
              style={{ animationDelay: `${i * 100 + 150}ms` }}
            ></div>
            
            {/* Shimmer Sweep */}
            <div 
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/20 to-transparent pointer-events-none" 
              style={{ animation: 'shimmer 2s infinite ease-in-out', animationDelay: `${i * 150}ms` }} 
            />
          </div>
        ))}
      </div>

      {/* 3. Quick Actions & Lists */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative bg-white border border-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 h-28 overflow-hidden shadow-sm">
                <div 
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50/50 animate-pulse" 
                  style={{ animationDelay: `${i * 100}ms` }}
                ></div>
                <div 
                  className="h-3 w-16 bg-blue-100/80 animate-pulse rounded-full" 
                  style={{ animationDelay: `${i * 100 + 150}ms` }}
                ></div>
                <div 
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/20 to-transparent pointer-events-none" 
                  style={{ animation: 'shimmer 2s infinite ease-in-out', animationDelay: `${i * 150}ms` }} 
                />
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="h-6 w-48 bg-blue-100/80 animate-pulse rounded-md mb-4"></div>
            <div className="relative bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden divide-y divide-blue-50/30">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50/50 animate-pulse" 
                      style={{ animationDelay: `${i * 100}ms` }}
                    ></div>
                    <div className="space-y-2">
                      <div 
                        className="h-4 w-32 bg-blue-100/80 animate-pulse rounded-full" 
                        style={{ animationDelay: `${i * 100 + 150}ms` }}
                      ></div>
                      <div 
                        className="h-3 w-20 bg-blue-50 animate-pulse rounded-full" 
                        style={{ animationDelay: `${i * 100 + 300}ms` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <div 
                      className="h-5 w-20 bg-blue-100/80 animate-pulse rounded-full" 
                      style={{ animationDelay: `${i * 100 + 150}ms` }}
                    ></div>
                    <div 
                      className="h-3 w-12 bg-blue-50 animate-pulse rounded-full" 
                      style={{ animationDelay: `${i * 100 + 300}ms` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/20 to-transparent pointer-events-none" style={{ animation: 'shimmer 2s infinite ease-in-out' }} />
            </div>
          </div>
        </div>

        {/* Right Column: Top Products */}
        <div>
          <div className="h-6 w-40 bg-blue-100/80 animate-pulse rounded-md mb-4"></div>
          <div className="relative bg-white rounded-2xl border border-blue-50 shadow-sm p-2 overflow-hidden space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 flex justify-between items-center rounded-xl bg-blue-50/10">
                <div className="flex items-center gap-3 w-full">
                  <div 
                    className="w-4 h-4 bg-blue-50 animate-pulse rounded-full" 
                    style={{ animationDelay: `${i * 100}ms` }}
                  ></div>
                  <div 
                    className="h-4 w-2/3 bg-blue-100/80 animate-pulse rounded-full" 
                    style={{ animationDelay: `${i * 100 + 150}ms` }}
                  ></div>
                </div>
                <div 
                  className="h-6 w-16 bg-gradient-to-br from-blue-100 to-blue-50 animate-pulse rounded-md" 
                  style={{ animationDelay: `${i * 100 + 200}ms` }}
                ></div>
              </div>
            ))}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/20 to-transparent pointer-events-none" style={{ animation: 'shimmer 2s infinite ease-in-out' }} />
          </div>
        </div>

      </div>

      {/* Global Keyframes for the Shimmer effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}