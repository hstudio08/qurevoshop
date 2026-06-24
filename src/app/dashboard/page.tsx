"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Plus, Banknote, CreditCard, User, 
  ShoppingCart, Package, Users, FileText, Store, TrendingUp, X, Download
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useProductStore } from "@/store/useProductStore";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";

export default function Dashboard() {
  const { shop } = useAuthStore();
  const { sales, fetchSales } = useSalesStore();
  const { fetchProducts } = useProductStore();
  
  const [mounted, setMounted] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (shop?.id) {
      fetchSales(shop.id);
      fetchProducts(shop.id);
    }
  }, [shop, fetchSales, fetchProducts]);

  const todayDate = new Date();
  const dateString = todayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const hour = todayDate.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const todaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
  }, [sales]);

  const todayStats = useMemo(() => {
    return todaysSales.reduce((acc, sale) => {
      acc.totalSales += sale.totalAmount || 0;
      acc.totalProfit += sale.profit || 0;
      acc.transactions += 1;
      
      if (sale.paymentMethod === "Cash") acc.cashReceived += sale.totalAmount;
      if (sale.paymentMethod === "Online") acc.onlineReceived += sale.totalAmount;
      if (sale.paymentMethod === "Credit") acc.creditGiven += sale.totalAmount;

      return acc;
    }, { totalSales: 0, totalProfit: 0, cashReceived: 0, onlineReceived: 0, creditGiven: 0, transactions: 0 });
  }, [todaysSales]);

  const inHandProfit = todayStats.totalProfit - todayStats.creditGiven;

  const topProducts = useMemo(() => {
    const counts: Record<string, {name: string, sold: number}> = {};
    todaysSales.forEach(sale => {
      sale.items?.forEach((item: any) => {
        if (!counts[item.productId]) counts[item.productId] = { name: item.productName, sold: 0 };
        counts[item.productId].sold += item.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.sold - a.sold).slice(0, 5);
  }, [todaysSales]);

  const downloadReport = async () => {
    const reportElement = document.getElementById("end-day-report-content");
    if (!reportElement) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportElement, { scale: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width);
      pdf.save(`End_Day_Report_${dateString.replace(/ /g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF Generation Error:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!mounted) return <DashboardSkeleton />;

  return (
    <div className="pb-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 font-sans bg-slate-50 min-h-screen pt-4 sm:pt-8">
      
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{greeting}, {shop?.ownerName?.split(' ')[0] || "Admin"}</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
            <Store size={16}/> {shop?.shopName || "My Store"} • {dateString}
          </p>
        </div>
        <button 
          onClick={() => setIsReportOpen(true)} 
          className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition"
        >
          <FileText size={18} /> Generate End-of-Day Report
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gross Sales Today</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{todayStats.totalSales.toLocaleString()}</p>
          <div className="absolute right-4 bottom-4 text-slate-100"><TrendingUp size={48}/></div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gross Profit</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tighter">₹{todayStats.totalProfit.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">In-Hand Profit</p>
          <p className="text-3xl font-black text-white tracking-tighter">₹{inHandProfit.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-2">After deducting ₹{todayStats.creditGiven} given in credit</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cashflow Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Cash</span><span className="font-bold text-slate-900">₹{todayStats.cashReceived}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Online</span><span className="font-bold text-indigo-600">₹{todayStats.onlineReceived}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Credit</span><span className="font-bold text-orange-500">₹{todayStats.creditGiven}</span></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/sales" className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:border-indigo-400 hover:shadow-md transition group">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:scale-110 transition"><ShoppingCart size={24} /></div>
              <span className="text-sm font-bold text-slate-800">New Sale</span>
            </Link>
            <Link href="/products" className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:border-emerald-400 hover:shadow-md transition group">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl group-hover:scale-110 transition"><Package size={24} /></div>
              <span className="text-sm font-bold text-slate-800">Add Product</span>
            </Link>
            <button onClick={() => setIsReportOpen(true)} className="sm:hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-xl active:scale-95 transition">
              <div className="bg-slate-800 text-white p-3 rounded-xl"><FileText size={24} /></div>
              <span className="text-sm font-bold text-white">Daily Report</span>
            </button>
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Recent Transactions</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {todaysSales.length === 0 ? (
                <div className="p-10 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">No sales recorded today.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {todaysSales.slice(0, 6).map(sale => (
                    <div key={sale.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${sale.paymentMethod === 'Credit' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                          {sale.customerName ? sale.customerName.charAt(0).toUpperCase() : <FileText size={16}/>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{sale.customerName || "Walk-in Customer"}</p>
                          <p className="text-xs text-slate-500 font-medium">{new Date(sale.date).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})} • {sale.items?.length} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-slate-900 tracking-tight">₹{sale.totalAmount.toLocaleString()}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${sale.paymentMethod === 'Credit' ? 'text-orange-600' : 'text-emerald-600'}`}>{sale.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Top Sellers Today</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
            {topProducts.length === 0 ? (
              <div className="p-10 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">No data yet.</div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-50 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-black text-slate-300">{idx + 1}</span>
                    <p className="text-sm font-bold text-slate-800">{prod.name}</p>
                  </div>
                  <p className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">{prod.sold} sold</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0 rounded-t-3xl">
              <h2 className="text-xl font-black text-slate-900">End of Day Report</h2>
              <button onClick={() => setIsReportOpen(false)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"><X size={20}/></button>
            </div>

            {/* 🔥 FIX: ALL TAILWIND COLORS REPLACED WITH RAW HEX STRINGS IN THIS PRINTABLE AREA 🔥 */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#ffffff]" id="end-day-report-content">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">{shop?.shopName}</h1>
                <p className="text-sm font-medium text-[#64748b] mt-1">{dateString}</p>
                <div className="w-16 h-1 bg-[#4f46e5] mx-auto mt-4 rounded-full"></div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#f8fafc] p-5 rounded-2xl border border-[#f1f5f9]">
                  <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-4">Core Metrics</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#475569] font-bold">Total Gross Sales</span>
                    <span className="text-xl font-black text-[#0f172a]">₹{todayStats.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#475569] font-bold">Total Gross Profit</span>
                    <span className="text-lg font-black text-[#059669]">₹{todayStats.totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[#e2e8f0]">
                    <span className="text-[#4f46e5] font-bold">Net In-Hand Profit</span>
                    <span className="text-2xl font-black text-[#4f46e5] tracking-tight">₹{inHandProfit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-[#f1f5f9] rounded-2xl bg-[#ffffff]">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Total Transactions</p>
                    <p className="text-xl font-black text-[#0f172a] mt-1">{todayStats.transactions}</p>
                  </div>
                  <div className="p-4 border border-[#ffedd5] rounded-2xl bg-[#fff7ed]">
                    <p className="text-[10px] font-bold text-[#fb923c] uppercase tracking-widest">Credit Given Today</p>
                    <p className="text-xl font-black text-[#ea580c] mt-1">₹{todayStats.creditGiven.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white shrink-0 rounded-b-3xl">
              <button 
                onClick={downloadReport} 
                disabled={isDownloading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition disabled:opacity-50"
              >
                <Download size={20} /> {isDownloading ? "Generating PDF..." : "Download PDF Report"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}