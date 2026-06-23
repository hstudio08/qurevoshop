"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Plus, Banknote, CreditCard, User, 
  ShoppingCart, Package, Users, ChevronRight, FileText, CheckCircle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useProductStore } from "@/store/useProductStore";
import EndDayReport from "@/components/features/EndDayReport";
import Link from "next/link";

export default function Dashboard() {
  const { shop } = useAuthStore();
  const { sales, fetchSales } = useSalesStore();
  const { products, fetchProducts } = useProductStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (shop?.id) {
      fetchSales(shop.id);
      fetchProducts(shop.id);
    }
  }, [shop, fetchSales, fetchProducts]);

  // Date & Time formatting
  const todayDate = new Date();
  const dateString = todayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const hour = todayDate.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Filter Today's Sales
  const todaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
  }, [sales]);

  // Derived Daily Stats
  const todayStats = useMemo(() => {
    return todaysSales.reduce((acc, sale) => {
      acc.totalSales += sale.totalAmount;
      acc.totalProfit += sale.profit;
      acc.transactions += 1;
      acc.itemsSold += sale.items ? sale.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      
      if (sale.paymentMethod === "Cash") acc.cashReceived += sale.totalAmount;
      if (sale.paymentMethod === "Online") acc.onlineReceived += sale.totalAmount;
      if (sale.paymentMethod === "Credit") acc.creditGiven += sale.totalAmount;

      return acc;
    }, { totalSales: 0, totalProfit: 0, cashReceived: 0, onlineReceived: 0, creditGiven: 0, transactions: 0, itemsSold: 0 });
  }, [todaysSales]);

  const inHandProfit = todayStats.totalProfit - todayStats.creditGiven;

  // Top Products (Today Only)
  const topProducts = useMemo(() => {
    const counts: Record<string, {name: string, sold: number}> = {};
    todaysSales.forEach(sale => {
      sale.items?.forEach(item => {
        if (!counts[item.productId]) counts[item.productId] = { name: item.productName, sold: 0 };
        counts[item.productId].sold += item.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.sold - a.sold).slice(0, 4);
  }, [todaysSales]);

  // Helper for "Time Ago"
  const timeAgo = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return "Earlier today";
  };

  if (!mounted) return null;

  return (
    <div className="pb-24 max-w-md mx-auto w-full px-4 sm:px-6">
      
      {/* 1. Header (Ultra-Compact) */}
      <header className="flex justify-between items-center py-4 mb-2">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">{shop?.shopName || "My Store"}</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{dateString} • {greeting}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-baltic-blue text-white flex items-center justify-center font-black text-sm shadow-sm overflow-hidden border border-blue-100">
          {shop?.shopLogoUrl ? <img src={shop.shopLogoUrl} className="w-full h-full object-cover" alt="Logo"/> : (shop?.ownerName?.charAt(0) || "Q")}
        </div>
      </header>

      {/* 2. Business Summary Ledger (Single Dense Card) */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-600">Today's Sales</span>
          <span className="text-lg font-black text-gray-900 font-ibm">₹{todayStats.totalSales.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-600">Gross Profit</span>
          <span className="text-base font-black text-sage-green font-ibm">₹{todayStats.totalProfit.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-100 my-3 border-dashed"></div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-black text-baltic-blue">In-Hand Profit</span>
          <span className="text-xl font-black text-baltic-blue font-ibm bg-blue-50 px-2 py-0.5 rounded-lg tracking-tight">₹{inHandProfit.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. Micro KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 opacity-5 text-gray-900"><Banknote size={32}/></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cash Rcvd</span>
          <span className="text-sm font-black text-gray-900 font-ibm">₹{todayStats.cashReceived}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute -right-2 -bottom-2 opacity-5 text-rich-cerulean"><CreditCard size={32}/></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online</span>
          <span className="text-sm font-black text-rich-cerulean font-ibm">₹{todayStats.onlineReceived}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex flex-col gap-1 relative overflow-hidden bg-orange-50/30">
          <div className="absolute -right-2 -bottom-2 opacity-5 text-orange-500"><User size={32}/></div>
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Credit</span>
          <span className="text-sm font-black text-orange-500 font-ibm">₹{todayStats.creditGiven}</span>
        </div>
      </div>

      {/* 4. Quick Actions (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/sales" className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 shadow-sm active:scale-95 transition">
          <div className="bg-blue-50 text-baltic-blue p-2 rounded-lg"><ShoppingCart size={18} /></div>
          <span className="text-xs font-bold text-gray-800">New Sale</span>
        </Link>
        <Link href="/products" className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 shadow-sm active:scale-95 transition">
          <div className="bg-green-50 text-sage-green p-2 rounded-lg"><Package size={18} /></div>
          <span className="text-xs font-bold text-gray-800">Add Product</span>
        </Link>
        <Link href="/credits" className="bg-white border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 shadow-sm active:scale-95 transition">
          <div className="bg-orange-50 text-orange-500 p-2 rounded-lg"><Users size={18} /></div>
          <span className="text-xs font-bold text-gray-800">Add Credit</span>
        </Link>
        <div className="bg-baltic-blue text-white rounded-xl shadow-sm active:scale-95 transition flex items-stretch">
          {/* Inject End Day Report cleanly into the grid slot */}
          <div className="w-full h-full [&>button]:h-full [&>button]:w-full [&>button]:bg-transparent [&>button]:shadow-none [&>button]:text-xs [&>button]:font-bold [&>button]:justify-start [&>button]:px-3.5 [&>button]:gap-3">
             <EndDayReport shopName={shop?.shopName || "Store"} date={dateString} stats={todayStats} />
          </div>
        </div>
      </div>

      {/* 5. Recent Activity List */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-3 tracking-wide">Recent Transactions</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-gray-50">
          {todaysSales.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No sales recorded today.</div>
          ) : (
            todaysSales.slice(0, 5).map(sale => {
               const itemName = sale.items?.length === 1 ? sale.items[0].productName : `${sale.items?.length || 0} Items`;
               const qty = sale.items?.length === 1 ? `x ${sale.items[0].quantity}` : '';
               return (
                <div key={sale.id} className="p-3.5 flex justify-between items-center active:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${sale.paymentMethod === 'Credit' ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-500'}`}>
                      {sale.customerName ? sale.customerName.charAt(0).toUpperCase() : <FileText size={14}/>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{sale.customerName || itemName}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{sale.customerName ? itemName : ''} {qty} • {timeAgo(sale.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 font-ibm tracking-tight">₹{sale.totalAmount}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${sale.paymentMethod === 'Credit' ? 'text-orange-500' : 'text-sage-green'}`}>{sale.paymentMethod}</p>
                  </div>
                </div>
               )
            })
          )}
        </div>
      </div>

      {/* 6. Top Products (Today) */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3 tracking-wide">Top Products Today</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-gray-50">
          {topProducts.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No products sold yet.</div>
          ) : (
            topProducts.map((prod, idx) => (
              <div key={idx} className="p-3.5 flex justify-between items-center">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 font-black">{idx + 1}.</span> {prod.name}
                </p>
                <p className="text-xs font-black text-baltic-blue font-ibm bg-blue-50 px-2 py-1 rounded-md">{prod.sold} sold</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <Link href="/sales" className="fixed bottom-20 right-5 w-14 h-14 bg-baltic-blue text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(5,102,141,0.4)] active:scale-90 transition-transform duration-200 z-40 lg:hidden">
        <Plus size={24} strokeWidth={2.5} />
      </Link>
    </div>
  );
}