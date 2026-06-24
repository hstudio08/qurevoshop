"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, Settings, UserSquare } from "lucide-react";

// 1. Move static array OUTSIDE the component so it isn't recreated on every render
const NAV_ITEMS = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Customers", href: "/customers", icon: UserSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

function BottomNav() {
  const pathname = usePathname();

  return (
    // 2. Added transform-gpu to offload rendering to the phone's GPU for smoother scrolling
    <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe pb-2 pt-2 px-4 z-50 transform-gpu will-change-transform">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          // 3. Pre-calculate active state for faster evaluation
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              // 4. Added prefetch={true} so Next.js downloads the next page BEFORE the user even clicks
              prefetch={true}
              className="group flex flex-col items-center justify-center w-16 h-12 relative touch-manipulation"
            >
              {/* Animated active indicator background */}
              <div className={`absolute inset-0 rounded-xl transition-all duration-300 -z-10 ${isActive ? "bg-blue-50/50 scale-100" : "scale-50 opacity-0 group-hover:bg-gray-50 group-hover:scale-100 group-hover:opacity-100"}`} />
              
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-all duration-300 ${isActive ? "text-blue-600 -translate-y-0.5" : "text-gray-400 group-hover:text-gray-600"}`}
              />
              <span 
                className={`text-[10px] transition-all duration-300 mt-1 ${isActive ? "font-bold text-blue-600" : "font-medium text-gray-500 group-hover:text-gray-700"}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// 5. React.memo caches the component so it ONLY re-renders if the route changes
export default memo(BottomNav);