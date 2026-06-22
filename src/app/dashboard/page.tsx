"use client";

import { useEffect, useMemo } from "react";
import { 
  IndianRupee, TrendingUp, Banknote, CreditCard, User, 
  ShoppingCart, Package, Users, FileText, ShieldCheck, 
  ChevronDown, Wallet, AlertTriangle 
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useProductStore } from "@/store/useProductStore";
import EndDayReport from "@/components/features/EndDayReport";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { shop } = useAuthStore();
  const { sales, fetchSales } = useSalesStore();
  const { products, fetchProducts } = useProductStore();

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    if (shop?.id) {
      fetchSales(shop.id);
      fetchProducts(shop.id);
    }
  }, [shop, fetchSales, fetchProducts]);

  // Derived Daily Stats
  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });

    return todaysSales.reduce((acc, sale) => {
      acc.totalSales += sale.totalAmount;
      acc.totalProfit += sale.profit;
      acc.transactions += 1;
      acc.itemsSold += sale.quantity;

      if (sale.paymentMethod === "Cash") acc.cashReceived += sale.totalAmount;
      if (sale.paymentMethod === "Online") acc.onlineReceived += sale.totalAmount;
      if (sale.paymentMethod === "Credit") acc.creditGiven += sale.totalAmount;

      return acc;
    }, { totalSales: 0, totalProfit: 0, cashReceived: 0, onlineReceived: 0, creditGiven: 0, transactions: 0, itemsSold: 0 });
  }, [sales]);

  // In-Hand Profit = Total Profit - Credit Given Today
  const inHandProfit = todayStats.totalProfit - todayStats.creditGiven;

  // Real Chart Data: Last 7 Days
  const chartData = useMemo(() => {
    const last7Days: { dateObj: Date; name: string; sales: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      last7Days.push({ 
        dateObj: d, 
        name: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), 
        sales: 0 
      });
    }

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0,0,0,0);
      const dayMatch = last7Days.find(d => d.dateObj.getTime() === saleDate.getTime());
      if (dayMatch) {
        dayMatch.sales += sale.totalAmount;
      }
    });

    return last7Days;
  }, [sales]);

  // Derive Top Products
  const topProducts = useMemo(() => {
    const productCounts: Record<string, {name: string, sold: number}> = {};
    sales.forEach(sale => {
      if (!productCounts[sale.productId]) {
        productCounts[sale.productId] = { name: sale.productName, sold: 0 };
      }
      productCounts[sale.productId].sold += sale.quantity;
    });
    return Object.values(productCounts).sort((a, b) => b.sold - a.sold).slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-bebas tracking-wide">
            Welcome back, {shop?.ownerName?.split(' ')[0] || "Owner"}! 👋
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Here's your business summary for today.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-xs font-bold text-gray-600 w-fit">
          <span>📅 {currentDate}</span>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard icon={IndianRupee} title="Total Sales" amount={todayStats.totalSales} subtitle="Today's Revenue" accent="border-blue-500" iconBg="bg-blue-50" iconColor="text-blue-500" />
        <StatCard icon={TrendingUp} title="Total Profit" amount={todayStats.totalProfit} subtitle="Today's Margin" accent="border-green-500" iconBg="bg-green-50" iconColor="text-green-500" />
        <StatCard icon={Wallet} title="In-Hand Profit" amount={inHandProfit} subtitle="Profit - Credit" accent="border-emerald-500" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard icon={Banknote} title="Cash Rcvd" amount={todayStats.cashReceived} subtitle="In Drawer" accent="border-orange-500" iconBg="bg-orange-50" iconColor="text-orange-500" />
        <StatCard icon={CreditCard} title="Online Rcvd" amount={todayStats.onlineReceived} subtitle="In Bank" accent="border-indigo-500" iconBg="bg-indigo-50" iconColor="text-indigo-500" />
        <StatCard icon={User} title="Credit Given" amount={todayStats.creditGiven} subtitle="Pending Dues" accent="border-red-500" iconBg="bg-red-50" iconColor="text-red-500" />
      </div>

      {/* Row 2: Quick Actions & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-6 font-bebas tracking-wide">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 flex-1">
            <QuickAction href="/sales" icon={ShoppingCart} title="New Sale" colorClass="bg-blue-50 text-blue-600 border-blue-100" />
            <QuickAction href="/products" icon={Package} title="Add Product" colorClass="bg-green-50 text-green-600 border-green-100" />
            <QuickAction href="/credits" icon={Users} title="Credits" colorClass="bg-purple-50 text-purple-600 border-purple-100" />
            <QuickAction href="/customers" icon={User} title="Customers" colorClass="bg-orange-50 text-orange-500 border-orange-100" />
            
            {/* End Day Report - Takes remaining space elegantly */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex items-stretch">
              <EndDayReport shopName={shop?.shopName || "Store"} date={currentDate} stats={todayStats} />
            </div>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900 font-bebas tracking-wide">Today's Overview</h3>
            <button className="text-xs font-bold text-gray-500 flex items-center gap-1 border border-gray-200 px-2 py-1 rounded-md">Today <ChevronDown size={12}/></button>
          </div>
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <OverviewRow icon={Package} title="Items Sold" value={todayStats.itemsSold} color="text-blue-600 bg-blue-50" />
            <OverviewRow icon={FileText} title="Transactions" value={todayStats.transactions} color="text-green-600 bg-green-50" />
            <OverviewRow icon={AlertTriangle} title="Low Stock" value={products.filter(p=>p.currentStock<=10).length} color="text-orange-500 bg-orange-50" />
            <OverviewRow icon={Users} title="Credit Bills" value={sales.filter(s=>s.paymentMethod==='Credit' && new Date(s.date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)).length} color="text-red-500 bg-red-50" />
          </div>
        </div>
      </div>

      {/* Row 3: Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900 font-bebas tracking-wide">Sales Trend (7 Days)</h3>
            <button className="text-xs font-bold text-gray-500 flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg">Last 7 Days <ChevronDown size={14}/></button>
          </div>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-ibm)'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-ibm)'}} tickFormatter={(val) => `₹${val/1000}K`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontFamily: 'var(--font-ibm)', fontWeight: 'bold' }} 
                  formatter={(value) => [`₹ ${Number(value).toLocaleString()}`, "Sales"]} 
                />
                <Line type="monotone" dataKey="sales" stroke="#05668d" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#05668d'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900 font-bebas tracking-wide">Top Products</h3>
            <button className="text-xs font-bold text-gray-500 flex items-center gap-1 border border-gray-200 px-2 py-1 rounded-md">All Time <ChevronDown size={12}/></button>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
               <div className="text-center text-gray-400 text-sm py-10 font-medium">No sales recorded yet</div>
            ) : topProducts.map((prod, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-black shrink-0 tabular-nums">{index + 1}</div>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><Package size={14}/></div>
                  <p className="text-[13px] font-bold text-gray-800 truncate">{prod.name}</p>
                </div>
                <p className="text-sm font-black text-baltic-blue font-ibm shrink-0 pl-2 tabular-nums">{prod.sold} <span className="text-[9px] font-medium text-gray-400">Sold</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-[#f0f5ff] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-blue-100">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Grow your business smarter with Qurevo Shop</h4>
            <p className="text-sm text-gray-500">Simple. Fast. Reliable.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          Powered by <img src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" alt="Qurevo" className="h-5 object-contain" />
        </div>
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// REFINED SUB-COMPONENTS
// -------------------------------------------------------------

const StatCard = ({ icon: Icon, title, amount, subtitle, accent, iconBg, iconColor }: any) => (
  <div className={`bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden flex flex-col justify-between`}>
    <div className={`absolute left-0 top-0 h-full w-1 ${accent}`}></div>
    <div className="flex justify-between items-start mb-2 pl-1">
      <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate pr-1">{title}</p>
      <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} group-hover:scale-110 transition-transform shrink-0`}><Icon size={14} /></div>
    </div>
    <div className="pl-1">
      <h3 className={`text-lg sm:text-xl font-black font-ibm tracking-tight truncate tabular-nums ${amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {amount < 0 ? '-' : ''}₹{Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </h3>
      <p className="text-[9px] font-medium text-gray-400 mt-0.5 truncate">{subtitle}</p>
    </div>
  </div>
);

const QuickAction = ({ href, icon: Icon, title, colorClass }: any) => (
  <Link href={href} className={`flex flex-col items-center justify-center p-3 sm:p-4 border ${colorClass} rounded-xl hover:shadow-sm hover:brightness-95 transition-all group h-full w-full`}>
    <div className="mb-2 group-hover:scale-110 transition-transform"><Icon size={22} /></div>
    <p className="text-[11px] sm:text-xs font-bold text-center leading-tight truncate w-full px-1">{title}</p>
  </Link>
);

const OverviewRow = ({ icon: Icon, title, value, color }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-3 overflow-hidden">
      <div className={`p-1.5 rounded-lg shrink-0 ${color}`}><Icon size={16} /></div>
      <p className="text-xs sm:text-sm font-bold text-gray-700 truncate">{title}</p>
    </div>
    <p className="text-sm font-black text-gray-900 tabular-nums shrink-0 pl-2">{value}</p>
  </div>
);