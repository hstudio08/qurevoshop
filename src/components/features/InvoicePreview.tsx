"use client";

import { useEffect, useState } from "react";
import { X, Download, Share2, Printer, CheckCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cart: any[];
  total: number;
  paymentMethod: string;
  customerName: string;
  shopDetails: any;
  isSubmitting: boolean;
}

export default function InvoicePreview({ 
  isOpen, onClose, onConfirm, cart, total, paymentMethod, customerName, shopDetails, isSubmitting 
}: InvoicePreviewProps) {
  
  const [cryptoHash, setCryptoHash] = useState<string>("GENERATING...");

  // Generate an actual SHA-256 Cryptographic Hash for bill authenticity
  useEffect(() => {
    if (isOpen) {
      const generateHash = async () => {
        try {
          const rawData = `${shopDetails?.id || 'SHOP'}-${customerName}-${total}-${Date.now()}-${JSON.stringify(cart)}`;
          const msgBuffer = new TextEncoder().encode(rawData);
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setCryptoHash(hashHex.substring(0, 16).toUpperCase());
        } catch (e) {
          setCryptoHash(`SECURE-${Date.now().toString(36).toUpperCase()}`);
        }
      };
      generateHash();
    }
  }, [isOpen, cart, total, customerName, shopDetails]);

  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit' });
  const custName = customerName.trim() || "Walk-In Customer";

  const getFileName = () => {
    const productSnippet = cart.map(item => item.productName.split(' ')[0]).slice(0, 2).join('-');
    const safeCustName = custName.replace(/[^a-zA-Z0-9]/g, '');
    return `INV_${safeCustName}_${productSnippet}_${cryptoHash.substring(0,6)}.pdf`;
  };

  const handleWhatsAppShare = async () => {
    const text = `*${shopDetails?.shopName || 'Store'} - E-Receipt*\n\nBill No: ${cryptoHash}\nDate: ${dateStr}\nCustomer: ${custName}\nTotal: ₹${total.toLocaleString()}\nPayment: ${paymentMethod}\n\nThank you for shopping with us!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Invoice', text: text }); } catch (err) { console.log("Share cancelled"); }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handlePrintOrDownload = () => {
    document.title = getFileName();
    window.print();
    toast.success("Ready for Print/PDF");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4 print:bg-white print:p-0">
      
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[24px] shadow-2xl flex flex-col max-h-[95dvh] overflow-hidden animate-in slide-in-from-bottom-4 print:shadow-none print:w-full print:rounded-none">
        
        {/* Header - Hidden on Print */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50 print:hidden">
          <h2 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={18} className="text-sage-green"/> Secure Invoice
          </h2>
          <button onClick={onClose} className="p-2 bg-white text-gray-500 rounded-full shadow-sm active:scale-90"><X size={18} /></button>
        </div>

        {/* THERMAL RECEIPT PREVIEW */}
        <div id="printable-invoice" className="p-6 overflow-y-auto custom-scrollbar bg-white font-mono text-sm text-gray-800 flex flex-col items-center">
          
          {/* Receipt Paper Container */}
          <div className="w-full max-w-[320px] mx-auto print:max-w-full">
            
            {/* Shop Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-black font-sans uppercase tracking-widest text-gray-900 mb-1">{shopDetails?.shopName || "STORE"}</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{shopDetails?.shopAddress || "Store Location"}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ph: {shopDetails?.mobileNumber}</p>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 w-full my-4"></div>

            {/* Meta Details */}
            <div className="text-[11px] mb-4 space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-bold">{dateStr} {timeStr}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Customer:</span> <span className="font-bold">{custName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment:</span> <span className="font-bold">{paymentMethod}</span></div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 w-full my-4"></div>

            {/* Items Table */}
            <table className="w-full text-[11px] mb-4">
              <thead>
                <tr className="text-left text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <th className="pb-2 w-1/2">Item</th>
                  <th className="pb-2 text-center w-1/4">Qty</th>
                  <th className="pb-2 text-right w-1/4">Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-2 font-bold text-gray-900 leading-tight">{item.productName}<br/><span className="text-[9px] text-gray-400 font-normal">₹{item.unitPrice} each</span></td>
                    <td className="py-2 text-center text-gray-700">x{item.quantity}</td>
                    <td className="py-2 text-right font-black text-gray-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-dashed border-gray-300 w-full my-4"></div>

            {/* Totals */}
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-bold text-gray-500 uppercase tracking-widest">Total Items</span>
              <span className="font-bold text-gray-900">{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-black uppercase tracking-widest text-gray-900">Grand Total</span>
              <span className="text-2xl font-black text-gray-900">₹{total.toLocaleString()}</span>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 w-full my-6"></div>

            {/* Cryptographic Signature & Footer */}
            <div className="text-center flex flex-col items-center gap-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">*** Thank you for visiting ***</p>
              
              <div className="mt-2 bg-gray-50 border border-gray-200 p-2 rounded-lg w-full">
                <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Cryptographic Bill Hash</p>
                <p className="text-[10px] font-black text-gray-700 break-all">{cryptoHash}</p>
              </div>

              <p className="text-[8px] text-gray-300 font-sans uppercase tracking-widest font-bold mt-2">
                Secured by Qurevo Point of Sale
              </p>
            </div>

          </div>
        </div>

        {/* Action Footer - Hidden on Print */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 shrink-0 pb-[env(safe-area-inset-bottom,16px)] print:hidden">
          
          <div className="flex gap-2">
            <button onClick={handlePrintOrDownload} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-100 active:scale-95 transition flex justify-center items-center gap-2 text-xs">
              <Printer size={16}/> Print Thermal / PDF
            </button>
            <button onClick={handleWhatsAppShare} className="flex-1 bg-[#25D366]/10 border border-[#25D366]/20 text-[#1DA851] font-bold py-3.5 rounded-xl shadow-sm hover:bg-[#25D366]/20 active:scale-95 transition flex justify-center items-center gap-2 text-xs">
              <Share2 size={16}/> Send via WhatsApp
            </button>
          </div>

          <button onClick={onConfirm} disabled={isSubmitting} className="w-full bg-gray-900 text-white font-black py-4.5 rounded-xl shadow-lg hover:bg-black active:scale-[0.98] transition disabled:opacity-70 flex justify-center items-center gap-2">
            {isSubmitting ? "Recording Transaction..." : <><CheckCircle size={18}/> Confirm & Record Sale</>}
          </button>
        </div>

      </div>
    </div>
  );
}