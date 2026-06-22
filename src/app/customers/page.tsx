"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ShoppingBag, Banknote, UserSquare, X, Package } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";

export default function CustomersPage() {
  const { shop } = useAuthStore();
  const { sales, fetchSales, isLoading } = useSalesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    if (shop?.id) fetchSales(shop.id);
  }, [shop, fetchSales]);

  const customerList = useMemo(() => {
    const map: Record<string, any> = {};
    sales.forEach(sale => {
      if (!sale.customerName) return; 
      const name = sale.customerName.trim().toUpperCase();
      
      if (!map[name]) map[name] = { name: sale.customerName, totalSpent: 0, totalVisits: 0, lastVisit: new Date(0), rawName: name };
      
      map[name].totalSpent += sale.totalAmount;
      map[name].totalVisits += 1;
      const saleDate = new Date(sale.date);
      if (saleDate > map[name].lastVisit) map[name].lastVisit = saleDate;
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales]);

  const filteredCustomers = customerList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Get specific customer's purchase history
  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter(s => s.customerName?.toUpperCase() === selectedCustomer.rawName).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, selectedCustomer]);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <header className="mb-6">
        <h1 className="text-xl font-black text-gray-900 font-bebas tracking-wide">Customer Directory</h1>
        <p className="text-xs text-gray-500">Track lifetime value and view purchase history</p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-gray-100 relative bg-gray-50/50">
          <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-baltic-blue outline-none" />
          <Search size={16} className="absolute left-6 top-5 text-gray-400" />
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? <div className="p-8 text-center text-xs text-gray-500">Loading...</div> : filteredCustomers.length === 0 ? (
            <div className="p-12 flex flex-col items-center">
              <UserSquare size={32} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">No named customers found.</p>
            </div>
          ) : (
            filteredCustomers.map((customer, i) => (
              <div key={i} onClick={() => setSelectedCustomer(customer)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-baltic-blue flex items-center justify-center font-bold text-sm">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{customer.name}</h3>
                    <p className="text-[10px] text-gray-500">Last: {customer.lastVisit.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">LTV</p>
                    <p className="text-sm font-bold text-sage-green font-ibm tracking-tighter">₹{customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-black text-gray-900">{selectedCustomer.name}</h2>
                <p className="text-xs text-gray-500">Lifetime History: {selectedCustomer.totalVisits} visits</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white rounded-full text-gray-500 hover:text-red-500 shadow-sm border border-gray-200"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {customerHistory.map(sale => {
                // Calculate if they got a discount relative to the profit margin
                const costPrice = sale.totalAmount - sale.profit;
                const cpPerUnit = costPrice / sale.quantity;
                const isDiscounted = sale.unitPrice < (cpPerUnit * 1.2); // Rough estimation logic if original SP isn't present
                
                return (
                  <div key={sale.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-baltic-blue"/>
                        <h4 className="text-sm font-bold text-gray-900">{sale.productName}</h4>
                      </div>
                      <span className="text-[10px] text-gray-500">{new Date(sale.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-lg text-center mt-2 border border-gray-100">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase">Qty</p>
                        <p className="text-xs font-bold text-gray-700">{sale.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase">Unit Price</p>
                        <p className="text-xs font-bold text-gray-700 font-ibm">₹{sale.unitPrice}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase">Total Paid</p>
                        <p className="text-xs font-bold text-sage-green font-ibm">₹{sale.totalAmount}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-gray-200">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sale.paymentMethod === 'Credit' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {sale.paymentMethod}
                      </span>
                      {isDiscounted && <span className="text-[10px] font-bold text-orange-500">Bargained / Discounted</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}