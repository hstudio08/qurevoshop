import { Package } from "lucide-react";

export function ProductsPageSkeleton() {
  return (
    <div className="pb-24 max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER & SEARCH SKELETON */}
      <div className="sticky top-0 z-30 pt-3 pb-3 sm:pt-6 sm:pb-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/50 -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100/50 animate-pulse hidden sm:block"></div>
            <div className="space-y-2">
               <div className="h-6 w-24 bg-blue-100/80 animate-pulse rounded-md"></div>
               <div className="h-3 w-16 bg-blue-50 animate-pulse rounded-md"></div>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-36 bg-blue-100/60 animate-pulse rounded-xl"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 h-10 bg-white border border-blue-50 shadow-sm rounded-xl animate-pulse"></div>
          <div className="flex gap-2 shrink-0">
            <div className="h-9 w-12 bg-slate-200/60 animate-pulse rounded-xl"></div>
            <div className="h-9 w-20 bg-slate-200/60 animate-pulse rounded-xl"></div>
            <div className="h-9 w-24 bg-slate-200/60 animate-pulse rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* GRID SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="relative bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden flex flex-col p-3 sm:p-4 group">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              
              {/* Image Skeleton Box */}
              <div 
                className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50/50 animate-pulse flex items-center justify-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Package size={24} className="text-blue-200/60" />
              </div>
              
              {/* Text Lines */}
              <div className="flex flex-col flex-1 min-w-0 gap-2.5 mt-1">
                <div 
                  className="h-3.5 sm:h-4 bg-blue-100/80 rounded-full w-4/5 animate-pulse"
                  style={{ animationDelay: `${i * 100 + 150}ms` }}
                ></div>
                <div 
                  className="h-2.5 sm:h-3 bg-blue-50 rounded-full w-2/5 animate-pulse" 
                  style={{ animationDelay: `${i * 100 + 300}ms` }}
                ></div>
                
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="h-2 sm:h-2.5 bg-blue-50/80 rounded-full w-1/4 animate-pulse" 
                    style={{ animationDelay: `${i * 100 + 450}ms` }}
                  ></div>
                  <div 
                    className="h-2 sm:h-2.5 bg-blue-100/60 rounded-full w-1/3 animate-pulse" 
                    style={{ animationDelay: `${i * 100 + 600}ms` }}
                  ></div>
                </div>
              </div>

              {/* Actions Box Skeleton */}
              <div className="w-8 flex flex-col gap-1.5 items-center shrink-0">
                 <div 
                   className="w-6 h-6 rounded-md bg-blue-50 animate-pulse"
                   style={{ animationDelay: `${i * 100 + 200}ms` }}
                 ></div>
                 <div 
                   className="w-6 h-6 rounded-md bg-blue-50/50 animate-pulse" 
                   style={{ animationDelay: `${i * 100 + 350}ms` }}
                 ></div>
              </div>
            </div>
            
            {/* Sweeping Shimmer Highlight */}
            <div 
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/20 to-transparent pointer-events-none"
              style={{
                animation: 'shimmer 2s infinite ease-in-out',
                animationDelay: `${i * 150}ms`
              }}
            />
          </div>
        ))}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}} />
      </div>
    </div>
  );
}