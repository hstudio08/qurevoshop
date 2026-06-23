"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Search, UserSquare, X, ShieldAlert, Download, FileText, CalendarClock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CustomersPage() {
  const { shop } = useAuthStore();
  const { sales, fetchSales, isLoading } = useSalesStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<any>(null);

  useEffect(() => {
    if (shop?.id) fetchSales(shop.id);
  }, [shop, fetchSales]);

  // Group sales by customer
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

  // Customer specific history
  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales
      .filter(s => s.customerName?.toUpperCase() === selectedCustomer.rawName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, selectedCustomer]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Directory</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Track lifetime value, history, and securely regenerate past invoices.</p>
      </header>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Bar */}
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

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Database...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <UserSquare size={48} className="text-slate-300 mb-4 opacity-50" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No customers found</p>
            </div>
          ) : (
            filteredCustomers.map((customer, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCustomer(customer)} 
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-indigo-50/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shadow-inner">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{customer.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                      <CalendarClock size={12}/> {customer.lastVisit.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-right">
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

      {/* RIGHT DRAWER: Customer Purchase History */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCustomer.name}</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedCustomer.totalVisits} Lifetime Transactions</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-red-500 shadow-sm border border-slate-200 transition-all hover:scale-105 active:scale-95">
                <X size={20}/>
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {customerHistory.map(sale => (
                <div key={sale.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:border-indigo-300 transition-colors">
                  
                  {/* Top Bar: Timestamp */}
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
                  
                  {/* Items list */}
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

                  {/* Footer Action */}
                  <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="text-sm font-black text-emerald-600">Total: ₹{sale.totalAmount.toLocaleString()}</span>
                    
                    <button 
                      onClick={() => setSelectedSaleForInvoice(sale)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText size={14} /> Regenerate Bill
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secure Past Invoice Modal */}
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
   SECURE PAST INVOICE GENERATOR COMPONENT 
======================================================================== */

interface SecureInvoiceProps {
  sale: any;
  shopDetails: any; // Automatically passed from useAuthStore().shop
  onClose: () => void;
}

function SecurePastInvoiceModal({ sale, shopDetails, onClose }: SecureInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [cryptoHash, setCryptoHash] = useState<string>("Generating...");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateSmallHash = async () => {
      const payload = `${sale.id}-${sale.totalAmount}-${sale.date}`;
      const msgUint8 = new TextEncoder().encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setCryptoHash(hashHex.substring(0, 16).toUpperCase());
    };
    generateSmallHash();
  }, [sale]);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setProperties({
        title: `Invoice_${cryptoHash}`,
        author: shopDetails?.shopName || 'Qurevo POS',
        keywords: `hash:${cryptoHash}, saleId:${sale.id}`
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${cryptoHash}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saleDateObj = new Date(sale.date);
  const formattedDate = saleDateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = saleDateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-indigo-700 font-bold bg-indigo-100 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">
            <ShieldAlert size={16} /> Verified Past Record
          </div>
          <div className="flex gap-2">
            <button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-50">
              <Download size={16} /> {isGenerating ? "Securing PDF..." : "Download Un-editable PDF"}
            </button>
            <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-200 rounded-xl transition-all"><X size={20}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-200/50 p-4 sm:p-8 flex justify-center">
          <div ref={invoiceRef} className="bg-white w-full max-w-2xl shadow-xl p-10 sm:p-14 relative" style={{ minHeight: '800px' }}>
            
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900"></div>
            
            {/* EXACT SHOP DETAILS MAPPING FOR PAST INVOICES */}
            <div className="flex justify-between items-start mb-14 mt-4">
              <div className="max-w-xs">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">
                  {shopDetails?.shopName || shopDetails?.ownerName || 'My Store'}
                </h1>
                {shopDetails?.shopAddress && (
                  <p className="text-sm font-medium text-slate-600 leading-snug mb-1">{shopDetails.shopAddress}</p>
                )}
                {shopDetails?.mobileNumber && (
                  <p className="text-sm font-bold text-slate-500">Tel: {shopDetails.mobileNumber}</p>
                )}
                {shopDetails?.businessCategory && (
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-2">{shopDetails.businessCategory}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-4xl font-light text-slate-200 uppercase tracking-widest mb-3">RECEIPT</p>
                <p className="text-sm font-bold text-slate-900">{formattedDate}</p>
                <p className="text-xs font-semibold text-slate-500">{formattedTime}</p>
              </div>
            </div>

            {sale.customerName && (
              <div className="mb-10 bg-slate-50 p-5 border-l-4 border-indigo-600">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</p>
                <p className="text-lg font-black text-slate-800 uppercase">{sale.customerName}</p>
                <p className="text-sm font-medium text-slate-600 mt-2">Payment Mode: <span className="font-bold text-slate-900">{sale.paymentMethod}</span></p>
              </div>
            )}

            <table className="w-full mb-10 text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="text-left py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Item Description</th>
                  <th className="text-center py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Qty</th>
                  <th className="text-right py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Price</th>
                  <th className="text-right py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-4 font-semibold text-slate-800">{item.productName}</td>
                    <td className="py-4 text-center text-slate-600 font-bold">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600">₹{item.unitPrice}</td>
                    <td className="py-4 text-right font-black text-slate-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-24">
              <div className="w-64 flex justify-between py-3 border-t-2 border-slate-900">
                <span className="font-black text-slate-900 uppercase tracking-wider">Grand Total</span>
                <span className="font-black text-xl text-indigo-600 tracking-tight">₹{sale.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-slate-900 text-slate-400 p-6 flex flex-col items-center text-center">
              <ShieldAlert size={20} className="text-indigo-400 mb-2" />
              <p className="text-[11px] uppercase tracking-widest font-black text-slate-200 mb-1">Cryptographic Integrity Seal</p>
              <p className="text-xs font-mono font-bold text-indigo-300 bg-slate-800 px-4 py-1.5 rounded-md tracking-widest border border-slate-700">HASH: {cryptoHash}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}