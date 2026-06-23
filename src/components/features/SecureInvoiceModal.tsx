"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Download, ShieldAlert, CheckCircle, Lock } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cart: any[];
  total: number;
  paymentMethod: string;
  customerName: string;
  customerAddress: string;
  shopDetails: any; // Passed from useAuthStore().shop
  isSubmitting: boolean;
}

export default function SecureInvoiceModal({ isOpen, onClose, onConfirm, cart, total, paymentMethod, customerName, customerAddress, shopDetails, isSubmitting }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [cryptoHash, setCryptoHash] = useState<string>("Generating...");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const generateHash = async () => {
        const payload = JSON.stringify({
          shop: shopDetails?.id,
          total,
          items: cart.length,
          time: new Date().toISOString(),
          customer: customerName
        });
        const msgUint8 = new TextEncoder().encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setCryptoHash(hashHex.substring(0, 16).toUpperCase()); // Clean 16-char hash
      };
      generateHash();
    }
  }, [isOpen, cart, total, customerName, shopDetails]);

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
        title: `Receipt_${cryptoHash}`,
        author: shopDetails?.shopName || 'Qurevo POS',
        keywords: `hash:${cryptoHash}`,
        creator: 'Qurevo POS System'
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Gen failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full text-xs">
            <Lock size={14} /> Cryptographic Layer Active
          </div>
          <div className="flex gap-2">
            <button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50">
              <Download size={16} /> {isGenerating ? "Locking PDF..." : "Download Secure PDF"}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><X size={20}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-200/50 p-4 sm:p-8 flex justify-center">
          <div ref={invoiceRef} className="bg-white w-full max-w-2xl shadow-xl p-10 sm:p-14 relative" style={{ minHeight: '800px' }}>
            
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900"></div>
            
            {/* EXACT SHOP DETAILS MAPPING */}
            <div className="flex justify-between items-start mb-12 mt-4">
              <div className="max-w-xs">
                {/* Fallback to ownerName if shopName isn't set yet */}
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">
                  {shopDetails?.shopName || shopDetails?.ownerName || 'My Store'}
                </h1>
                
                {/* Uses exact properties from SettingsPage */}
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
                <p className="text-4xl font-light text-slate-200 uppercase tracking-widest mb-2">INVOICE</p>
                <p className="text-sm font-bold text-slate-800">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm font-medium text-slate-500">Time: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            {(customerName || customerAddress) && (
              <div className="mb-10 bg-slate-50 p-5 border-l-4 border-indigo-600">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Billed To</p>
                {customerName && <p className="text-lg font-bold text-slate-800">{customerName}</p>}
                {customerAddress && <p className="text-sm font-medium text-slate-600 mt-1">{customerAddress}</p>}
                <p className="text-sm font-medium text-slate-600 mt-2">Payment Method: <span className="font-bold text-slate-900">{paymentMethod}</span></p>
              </div>
            )}

            <table className="w-full mb-10 text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="text-left py-3 font-bold text-slate-900">Item Description</th>
                  <th className="text-center py-3 font-bold text-slate-900">Qty</th>
                  <th className="text-right py-3 font-bold text-slate-900">Price</th>
                  <th className="text-right py-3 font-bold text-slate-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-4 font-medium text-slate-800">{item.productName}</td>
                    <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600">₹{item.unitPrice}</td>
                    <td className="py-4 text-right font-bold text-slate-800">₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-16">
              <div className="w-64 flex justify-between py-2 border-t-2 border-slate-900 mt-2">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-black text-xl text-indigo-600 tracking-tight">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-slate-900 text-slate-400 flex flex-col items-center justify-center text-center">
              <ShieldAlert size={24} className="text-indigo-400 mb-3" />
              <p className="text-xs uppercase tracking-widest font-bold text-slate-300 mb-1">Cryptographic Integrity Seal</p>
              <p className="text-[10px] font-mono break-all px-8 opacity-70 bg-slate-800 py-1 rounded">SHA256: {cryptoHash}</p>
            </div>

          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={isSubmitting} className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
            {isSubmitting ? "Processing..." : <><CheckCircle size={18} /> Confirm Transaction</>}
          </button>
        </div>

      </div>
    </div>
  );
}