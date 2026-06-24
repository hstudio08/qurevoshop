import { Package } from "lucide-react";

export function ProductsSkeleton() {
  return (
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
          
          {/* Sweeping Shimmer Highlight across the whole card */}
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
  );
}