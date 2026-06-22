"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getShopDetails } from "@/lib/firebase/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "./BottomNav";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ShieldCheck, UserSquare } from "lucide-react";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { setAuth, loading, user, shop } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const shopDetails = await getShopDetails(firebaseUser.uid, firebaseUser.email);
        setAuth(firebaseUser, shopDetails);
        if (isPublicPage) {
          router.push(shopDetails?.role === "Admin" ? "/admin" : "/dashboard");
        }
      } else {
        setAuth(null, null);
        if (!isPublicPage) router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [setAuth, isPublicPage, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-baltic-blue font-bebas text-2xl tracking-widest">LOADING QUREVO...</div>;

  // DYNAMIC NAVIGATION: Super Admin gets a dedicated view
  let navItems = [];
  if (shop?.role === "Admin") {
    navItems = [
      { name: "Super Admin", href: "/admin", icon: ShieldCheck },
      { name: "Settings", href: "/settings", icon: Settings },
    ];
  } else {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Products", href: "/products", icon: Package },
      { name: "Sales & Billing", href: "/sales", icon: ShoppingCart },
      { name: "Credits", href: "/credits", icon: Users },
      { name: "Customers", href: "/customers", icon: UserSquare },
      { name: "Settings", href: "/settings", icon: Settings },
    ];
  }

  const getAvatar = (name: string) => {
    if (!name) return "Q";
    const words = name.trim().split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* DESKTOP SIDEBAR */}
      {user && !isPublicPage && (
        <aside className="hidden lg:flex flex-col w-[220px] bg-white border-r border-gray-200 fixed h-full z-40 shadow-sm">
          <div className="px-5 py-6 flex items-center justify-start border-b border-gray-100 h-[64px]">
            <img src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" alt="Qurevo" className="h-6 object-contain" />
          </div>
          
          <nav className="flex-1 px-3 py-5 space-y-1.5 custom-scrollbar overflow-y-auto">
            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              {shop?.role === "Admin" ? "Administration" : "Main Menu"}
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? "bg-blue-50/80 border border-blue-100/50 shadow-sm text-baltic-blue" : "text-gray-600 hover:bg-gray-50 border border-transparent"}`}>
                  <div className={`${isActive ? "text-baltic-blue" : "text-gray-400 group-hover:text-baltic-blue"} transition-colors`}><Icon size={18} strokeWidth={isActive ? 2.5 : 2} /></div>
                  <span className={`text-[13px] ${isActive ? "font-bold" : "font-medium group-hover:font-semibold"}`}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <a href="mailto:qurevotechnologies@gmail.com" className="flex items-center gap-3 w-full bg-gray-50 border border-gray-200 p-3 rounded-xl hover:bg-white hover:shadow-sm hover:border-baltic-blue/30 transition-all group">
              <ShieldCheck size={18} className="text-gray-400 group-hover:text-baltic-blue" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-gray-700">Need Help?</p>
                <p className="text-[9px] text-gray-500">Contact Support</p>
              </div>
            </a>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col transition-all w-full ${user && !isPublicPage ? "lg:ml-[220px]" : ""}`}>
        
        {/* DESKTOP ONLY TOP HEADER */}
        {user && !isPublicPage && (
          <header className="hidden lg:flex h-[64px] bg-white/80 backdrop-blur-md border-b border-gray-200 items-center justify-end px-8 sticky top-0 z-30">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[13px] font-bold text-gray-900 group-hover:text-baltic-blue transition">{shop?.shopName}</span>
                <span className="text-[10px] font-medium text-gray-500">{shop?.ownerName}</span>
              </div>
              <div className="w-8 h-8 bg-baltic-blue text-white rounded-lg flex items-center justify-center font-bold text-sm font-bebas shadow-sm border border-blue-700/20 overflow-hidden group-hover:-translate-y-0.5 transition-transform">
                 {shop?.shopLogoUrl ? <img src={shop.shopLogoUrl} className="w-full h-full object-cover" alt="Logo"/> : getAvatar(shop?.shopName || "Store")}
              </div>
            </div>
          </header>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
          {children}
        </main>

        {user && !isPublicPage && <div className="lg:hidden"><BottomNav /></div>}
      </div>
    </div>
  );
}