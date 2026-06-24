"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Search, UserSquare, X, ShieldAlert, Download, FileText, CalendarClock, Phone, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CustomersPage() {
  const { shop, user } = useAuthStore();
  const { sales, fetchSales, isLoading } = useSalesStore();
  
  const activeShopId = shop?.id || (shop as any)?.uid || user?.uid;
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeShopId) fetchSales(activeShopId);
  }, [activeShopId, fetchSales]);

  const isPageLoading = !mounted || !activeShopId || isLoading;

  // UPGRADED: Safely extracts phone and address, ensuring the latest info is kept
  const customerList = useMemo(() => {
    const map: Record<string, any> = {};
    sales.forEach((sale: any) => {
      if (!sale.customerName) return; 
      const name = sale.customerName.trim().toUpperCase();
      
      if (!map[name]) {
        map[name] = { 
          name: sale.customerName, 
          phone: sale.customerPhone || "",
          address: sale.customerAddress || "",
          totalSpent: 0, 
          totalVisits: 0, 
          lastVisit: new Date(0), 
          rawName: name 
        };
      }
      
      // Update with the most recent contact details if they exist in later sales
      if (sale.customerPhone) map[name].phone = sale.customerPhone;
      if (sale.customerAddress) map[name].address = sale.customerAddress;

      map[name].totalSpent += sale.totalAmount;
      map[name].totalVisits += 1;
      const saleDate = new Date(sale.date);
      if (saleDate > map[name].lastVisit) map[name].lastVisit = saleDate;
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales]);

  const filteredCustomers = customerList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales
      .filter((s: any) => s.customerName?.toUpperCase() === selectedCustomer.rawName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, selectedCustomer]);

  if (isPageLoading) {
    return <CustomersPageSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Directory</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Track lifetime value, history, and securely regenerate past invoices.</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0 relative">
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full text-sm font-medium border border-slate-200 bg-white rounded-2xl pl-12 pr-4 py-3.5 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" 
          />
          <Search size={18} className="absolute left-8 top-7 text-slate-400" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
          {filteredCustomers.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
              <UserSquare size={48} className="text-slate-300 mb-4 opacity-50" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No customers found</p>
            </div>
          ) : (
            filteredCustomers.map((customer, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCustomer(customer)} 
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-indigo-50/30 transition-colors group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationFillMode: "both", animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shadow-inner shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{customer.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                      <CalendarClock size={12}/> {customer.lastVisit.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-right shrink-0">
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visits</p>
                    <p className="text-base font-black text-slate-700">{customer.totalVisits}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifetime Value</p>
                    <p className="text-lg font-black text-emerald-600 tracking-tight">₹{customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
              <div className="pr-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCustomer.name}</h2>
                {/* UPGRADED: Displaying Customer Profile Data */}
                {selectedCustomer.phone && (
                  <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {selectedCustomer.phone}</p>
                )}
                {selectedCustomer.address && (
                  <p className="text-sm font-medium text-slate-600 mt-0.5 flex items-center gap-1.5 leading-snug"><MapPin size={14} className="text-slate-400 shrink-0"/> {selectedCustomer.address}</p>
                )}
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-3 bg-indigo-50 inline-block px-2 py-1 rounded-md">{selectedCustomer.totalVisits} Lifetime Transactions</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-red-500 shadow-sm border border-slate-200 transition-all hover:scale-105 active:scale-95 shrink-0">
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {customerHistory.map(sale => (
                <div key={sale.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:border-indigo-300 transition-colors">
                  
                  <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</span>
                      <span className="text-xs font-bold text-slate-800">
                        {new Date(sale.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${sale.paymentMethod === 'Credit' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {sale.paymentMethod}
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    {sale.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700 truncate pr-2">
                          <span className="text-slate-400 font-bold mr-1">{item.quantity}x</span> 
                          {item.productName}
                        </span>
                        <span className="font-black text-slate-900 shrink-0">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="text-sm font-black text-emerald-600">Total: ₹{sale.totalAmount.toLocaleString()}</span>
                    
                    <button 
                      onClick={() => setSelectedSaleForInvoice(sale)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText size={14} /> View Invoice
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedSaleForInvoice && (
        <SecurePastInvoiceModal 
          sale={selectedSaleForInvoice}
          shopDetails={shop}
          onClose={() => setSelectedSaleForInvoice(null)}
        />
      )}

    </div>
  );
}

/* =====================================================================
   FULL PAGE SKELETON LOADER
======================================================================== */
function CustomersPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="h-10 w-72 bg-blue-100/80 animate-pulse rounded-lg mb-3"></div>
        <div className="h-4 w-96 max-w-full bg-blue-50 animate-pulse rounded-md"></div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0 relative">
           <div className="w-full h-12 bg-blue-50/50 animate-pulse rounded-2xl border border-blue-50/80"></div>
        </div>

        <div className="flex-1 overflow-hidden divide-y divide-blue-50/50">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 sm:p-6 flex items-center justify-between bg-white relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50/50 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                <div className="space-y-2.5">
                  <div className="h-4 w-32 bg-blue-100/80 animate-pulse rounded-full" style={{ animationDelay: `${i * 100 + 150}ms` }}></div>
                  <div className="h-2.5 w-20 bg-blue-50 animate-pulse rounded-full" style={{ animationDelay: `${i * 100 + 300}ms` }}></div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div className="hidden sm:block space-y-2.5">
                  <div className="h-2 w-10 bg-blue-50 animate-pulse rounded-full ml-auto" style={{ animationDelay: `${i * 100 + 100}ms` }}></div>
                  <div className="h-4 w-6 bg-blue-100/80 animate-pulse rounded-full ml-auto" style={{ animationDelay: `${i * 100 + 200}ms` }}></div>
                </div>
                <div className="space-y-2.5">
                  <div className="h-2 w-20 bg-blue-50 animate-pulse rounded-full ml-auto" style={{ animationDelay: `${i * 100 + 300}ms` }}></div>
                  <div className="h-5 w-24 bg-blue-100/80 animate-pulse rounded-full ml-auto" style={{ animationDelay: `${i * 100 + 400}ms` }}></div>
                </div>
              </div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/20 to-transparent pointer-events-none" style={{ animation: 'shimmer 2s infinite ease-in-out', animationDelay: `${i * 150}ms` }} />
            </div>
          ))}
          <style dangerouslySetInnerHTML={{__html: `@keyframes shimmer { 100% { transform: translateX(100%); } }`}} />
        </div>
      </div>
    </div>
  );
}


/* =====================================================================
   SECURE PAST INVOICE GENERATOR COMPONENT (UPGRADED SYNC)
======================================================================== */

interface SecureInvoiceProps {
  sale: any;
  shopDetails: any; 
  onClose: () => void;
}

function SecurePastInvoiceModal({ sale, shopDetails, onClose }: SecureInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // UPGRADED: Synchronous, universal derived values (Matches SalesPage perfectly)
  // Fallback used just in case there are legacy sales without the ID format
  const safeId = sale.id || `SALE-${new Date(sale.date).getTime()}`;
  const invoiceNumber = safeId.replace('SALE-', 'INV-');
  const immutableHash = safeId.replace('SALE-', '').substring(0, 10).split('').reverse().join('');

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setProperties({
        title: `${invoiceNumber}`,
        author: shopDetails?.shopName || 'Qurevo Shops',
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saleDateObj = new Date(sale.date);
  const formattedDate = saleDateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900/80 backdrop-blur-sm font-sans">
      
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-2 text-indigo-400 font-bold px-2 text-xs uppercase tracking-widest hidden sm:flex">
          <ShieldAlert size={16} /> Verified Past Record
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <button onClick={generatePDF} disabled={isGenerating} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50">
            <Download size={16} /> {isGenerating ? "Securing PDF..." : "Download PDF"}
          </button>
          <button onClick={onClose} className="p-2.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><X size={20}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800/50 p-4 sm:p-8 flex justify-center items-start custom-scrollbar">
        
        {/* FIX: ALL TAILWIND COLORS REPLACED WITH RAW HEX STRINGS IN THIS PRINTABLE AREA */}
        <div ref={invoiceRef} className="w-[794px] min-h-[1123px] shrink-0 bg-[#ffffff] relative shadow-2xl flex flex-col">
          
          <div className="h-3 w-full bg-[#0f172a] shrink-0"></div>
          
          <div className="p-16 flex-1 flex flex-col">
            
            <div className="flex justify-between items-start mb-12 border-b border-[#e2e8f0] pb-10">
              <div className="max-w-[350px]">
                <h1 className="text-3xl font-black text-[#0f172a] tracking-tight uppercase mb-3">
                  {shopDetails?.shopName || 'Store Name'}
                </h1>
                
                <div className="text-sm text-[#475569] space-y-1">
                  <p className="font-bold text-[#1e293b]">{shopDetails?.ownerName}</p>
                  {shopDetails?.shopAddress && <p>{shopDetails.shopAddress}</p>}
                  {(shopDetails?.state || shopDetails?.pincode) && (
                    <p>{shopDetails?.state} {shopDetails?.pincode}</p>
                  )}
                  {shopDetails?.mobileNumber && <p className="mt-2 text-[#334155]">P: {shopDetails.mobileNumber}</p>}
                  {shopDetails?.email && <p className="text-[#334155]">E: {shopDetails.email}</p>}
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-4xl font-light text-[#cbd5e1] tracking-widest mb-6">
                  {sale.invoiceGenerated ? "INVOICE" : "RECEIPT"}
                </h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-bold text-[#94a3b8] uppercase text-[10px] tracking-widest mb-0.5">Invoice Date</p>
                    <p className="font-bold text-[#1e293b]">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#94a3b8] uppercase text-[10px] tracking-widest mb-0.5">Invoice Number</p>
                    <p className="font-bold text-[#1e293b]">{invoiceNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-widest mb-2">Billed To</p>
                <h3 className="text-lg font-bold text-[#0f172a]">{sale.customerName || "Walk-in Customer"}</h3>
                {sale.customerPhone && <p className="text-sm text-[#64748b] mt-1">Ph: {sale.customerPhone}</p>}
                {sale.customerAddress && <p className="text-sm text-[#64748b] mt-1">{sale.customerAddress}</p>}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Payment Method</p>
                <p className="text-sm font-bold text-[#1e293b] bg-[#f8fafc] px-3 py-1 rounded-md border border-[#e2e8f0] inline-block">
                  {sale.paymentMethod}
                </p>
              </div>
            </div>

            <table className="w-full text-sm mb-12">
              <thead>
                <tr className="border-b-2 border-[#0f172a]">
                  <th className="text-left py-3 font-bold text-[#0f172a] uppercase tracking-wider text-xs">Description</th>
                  <th className="text-center py-3 font-bold text-[#0f172a] uppercase tracking-wider text-xs">Qty</th>
                  <th className="text-right py-3 font-bold text-[#0f172a] uppercase tracking-wider text-xs">Unit Price</th>
                  <th className="text-right py-3 font-bold text-[#0f172a] uppercase tracking-wider text-xs">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {sale.items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4 font-semibold text-[#1e293b]">{item.productName}</td>
                    <td className="py-4 text-center text-[#475569] font-medium">{item.quantity}</td>
                    <td className="py-4 text-right text-[#475569]">₹{item.unitPrice.toLocaleString()}</td>
                    <td className="py-4 text-right font-bold text-[#0f172a]">₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-16">
              <div className="w-72">
                <div className="flex justify-between py-2 text-sm text-[#475569] border-b border-[#f1f5f9] mb-2">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1e293b]">₹{sale.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-lg font-black text-[#0f172a] uppercase tracking-wider">Total Due</span>
                  <span className="text-2xl font-black text-[#0f172a]">₹{sale.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex-1"></div>

            <div className="border-t border-[#e2e8f0] pt-8 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-[#94a3b8] font-mono tracking-widest uppercase mb-6">
                Integrity Code: {immutableHash}
              </p>
              
              <div className="flex flex-col items-center opacity-60">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Powered By</p>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" 
                    alt="Qurevo Logo" 
                    className="h-5 object-contain grayscale"
                  />
                  <span className="text-sm font-black text-[#1e293b] tracking-tight">Qurevo Shops</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}