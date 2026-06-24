import React from "react";
import { X, CheckCircle2, Receipt, User, MapPin, CreditCard, Banknote, Store } from "lucide-react";

export default function SecureInvoiceModal({
  isOpen, onClose, onConfirm, cart, total, paymentMethod, customerName, customerAddress, shopDetails, isSubmitting
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-slate-100 shrink-0 bg-slate-50">
          <h2 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <Receipt size={14} /> Order Preview
          </h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Shopkeeper Details (Billed From) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed From</p>
            <p className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Store size={12} className="text-slate-400"/> {shopDetails?.shopName || "My Store"}</p>
            <p className="text-[11px] font-semibold text-slate-700">{shopDetails?.ownerName || "Shopkeeper"}</p>
            <p className="text-[10px] font-medium text-slate-500 leading-snug">{shopDetails?.shopAddress}</p>
            {(shopDetails?.state || shopDetails?.pincode) && (
              <p className="text-[10px] font-medium text-slate-500">{shopDetails?.state} {shopDetails?.pincode}</p>
            )}
          </div>

          {/* Customer Info (Billed To) */}
          {(customerName || customerAddress) && (
            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-1.5">
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Billed To</p>
              {customerName && <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><User size={12} className="text-indigo-400"/> {customerName}</p>}
              {customerAddress && <p className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5"><MapPin size={12} className="text-indigo-400"/> {customerAddress}</p>}
            </div>
          )}

          {/* Items List */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Items ({cart.length})</p>
            <div className="space-y-1.5 mb-4">
              {cart.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-xs font-medium text-slate-700">
                  <span className="flex-1 pr-2 leading-tight">
                    <span className="font-bold text-slate-900 mr-1">{item.quantity}x</span> 
                    {item.productName}
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            {/* Qurevo Branding */}
            <div className="mt-6 flex justify-center opacity-40">
              <img 
                src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" 
                alt="Qurevo" 
                className="h-3.5 object-contain grayscale"
              />
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {paymentMethod === "Cash" && <Banknote size={14} className="text-emerald-500" />}
              {paymentMethod === "Online" && <CreditCard size={14} className="text-blue-500" />}
              {paymentMethod === "Credit" && <User size={14} className="text-orange-500" />}
              {paymentMethod}
            </div>
            <span className="text-xl font-black text-emerald-600 tracking-tighter">₹{total.toLocaleString()}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-xl hover:bg-slate-100 transition active:scale-95 disabled:opacity-50"
            >
              Edit
            </button>
            <button 
              onClick={onConfirm} 
              disabled={isSubmitting}
              className="flex-[2] py-2.5 bg-indigo-600 text-white text-[11px] font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : <><CheckCircle2 size={14} /> Confirm Sale</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}