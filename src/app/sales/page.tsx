"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, FileText, Search, Minus, Plus, Banknote, CreditCard, User, Bell, Trash2, MapPin, Download } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";
import { recordSaleToDB } from "@/lib/firebase/saleService";
import { generateInvoicePdf } from "@/components/features/InvoiceGenerator";
import toast from "react-hot-toast";

export default function SalesPage() {
  const { shop } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { sales, fetchSales, deleteSale } = useSalesStore();
  
  const [activeTab, setActiveTab] = useState<"new" | "list">("new");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(""); 
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Credit">("Cash");
  const [wantInvoice, setWantInvoice] = useState(false);

  useEffect(() => {
    if (shop?.id) {
      if (products.length === 0) fetchProducts(shop.id);
      fetchSales(shop.id);
    }
  }, [shop, fetchProducts, fetchSales, products.length]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.sellingPrice.toString());
      setQuantity(1);
    }
  }, [selectedProductId, selectedProduct]);

  const unitPrice = customPrice !== "" ? Number(customPrice) : 0;
  const totalAmount = unitPrice * quantity;
  const totalProfit = selectedProduct ? (unitPrice - selectedProduct.costPrice) * quantity : 0;
  const isLoss = selectedProduct && unitPrice < selectedProduct.costPrice;
  const discountGiven = selectedProduct ? (selectedProduct.sellingPrice - unitPrice) * quantity : 0;

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !shop) return;
    if (quantity > selectedProduct.currentStock) return toast.error("Not enough stock!");
    // REMOVED: Name requirement check

    setIsSubmitting(true);
    const loadingToast = toast.loading("Recording sale...");
    try {
      const saleData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitPrice,
        totalAmount,
        profit: totalProfit,
        customerName: customerName || undefined,
        customerAddress: wantInvoice ? customerAddress : undefined,
        paymentMethod
      };

      const recordedSale = await recordSaleToDB(shop.id, saleData, selectedProduct.currentStock);
      
      if (wantInvoice) {
        generateInvoicePdf(shop, recordedSale as any);
        toast.success("Sale recorded & Invoice Downloaded!", { id: loadingToast });
      } else {
        toast.success("Sale recorded successfully!", { id: loadingToast });
      }
      
      setSelectedProductId(""); setCustomPrice(""); setQuantity(1);
      setCustomerName(""); setCustomerAddress(""); setWantInvoice(false);
      fetchProducts(shop.id); fetchSales(shop.id);
    } catch (error) {
      toast.error("Failed to record sale.", { id: loadingToast });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 lg:p-8 font-sans">
      <header className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-bebas tracking-wide">Sales & Billing</h1>
          <p className="text-sm text-gray-500">Record sales, adjust pricing, and issue invoices</p>
        </div>
      </header>

      <div className="flex gap-2 mb-6 max-w-sm">
        <button onClick={() => setActiveTab("new")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${activeTab === "new" ? "bg-baltic-blue text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}>
          <ShoppingCart size={18} /> New Bill
        </button>
        <button onClick={() => setActiveTab("list")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${activeTab === "list" ? "bg-baltic-blue text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}>
          <FileText size={18} /> History
        </button>
      </div>

      {activeTab === "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-6">Create New Sale</h3>
            <form onSubmit={handleAddSale} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Select Product</label>
                <select required value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-baltic-blue outline-none text-gray-900 font-medium">
                  <option value="" disabled>Choose a product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
                      {p.name} - ₹{p.sellingPrice} ({p.currentStock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#f8fafc] rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Price / Unit (₹)</label>
                    <input type="number" required min="0" step="0.01" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold font-ibm focus:ring-2 focus:ring-baltic-blue outline-none" />
                    {discountGiven > 0 && <p className="text-[10px] text-orange-500 font-bold mt-1">Discount: ₹{discountGiven.toFixed(2)}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Quantity</label>
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-[46px]">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 hover:bg-gray-50 text-gray-600"><Minus size={16} /></button>
                      <div className="flex-1 text-center text-sm font-bold tabular-nums">{quantity}</div>
                      <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-3 hover:bg-gray-50 text-gray-600"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <input type="checkbox" checked={wantInvoice} onChange={(e) => setWantInvoice(e.target.checked)} className="w-4 h-4 text-baltic-blue rounded focus:ring-baltic-blue" />
                  <span className="text-sm font-bold text-baltic-blue">Generate PDF Invoice for this sale</span>
                </label>

                <div className="relative">
                  {/* REMOVED REQUIRED ATTRIBUTE */}
                  <input type="text" placeholder="Customer Name (Optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3.5 pl-10 text-sm focus:ring-2 focus:ring-baltic-blue outline-none" />
                  <User className="absolute left-3 top-4 text-gray-400" size={16} />
                </div>

                {wantInvoice && (
                  <div className="relative animate-in fade-in slide-in-from-top-2">
                    <input type="text" placeholder="Customer Address (Optional)" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3.5 pl-10 text-sm focus:ring-2 focus:ring-baltic-blue outline-none" />
                    <MapPin className="absolute left-3 top-4 text-gray-400" size={16} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPaymentMethod("Cash")} className={`py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition border ${paymentMethod === "Cash" ? "bg-green-50 border-sage-green text-sage-green shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><Banknote size={16} /> Cash</button>
                  <button type="button" onClick={() => setPaymentMethod("Online")} className={`py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition border ${paymentMethod === "Online" ? "bg-blue-50 border-rich-cerulean text-rich-cerulean shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><CreditCard size={16} /> Online</button>
                  <button type="button" onClick={() => setPaymentMethod("Credit")} className={`py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition border ${paymentMethod === "Credit" ? "bg-orange-50 border-orange-500 text-orange-500 shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><User size={16} /> Credit</button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || !selectedProduct} className="w-full bg-baltic-blue text-white font-black py-4 rounded-xl shadow-md hover:bg-rich-cerulean transition active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                {isSubmitting ? "Processing..." : wantInvoice ? <><FileText size={18}/> Record & Download Invoice</> : "Record Sale"}
              </button>
            </form>
          </div>

          <div>
            <div className={`rounded-2xl p-6 border shadow-sm sticky top-[100px] transition-colors duration-300 ${isLoss ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <h3 className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">Live Transaction Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Subtotal ({quantity} items)</span>
                  <span className="text-lg font-bold text-gray-900 font-ibm tracking-tight">₹{totalAmount.toFixed(2)}</span>
                </div>
                
                {selectedProduct && (
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Original Value</span>
                    <span className="text-sm font-medium text-gray-400 line-through font-ibm">₹{(selectedProduct.sellingPrice * quantity).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className={`font-bold ${isLoss ? 'text-red-600' : 'text-sage-green'}`}>{isLoss ? 'Net Loss' : 'Estimated Profit'}</span>
                  <span className={`text-xl font-black font-ibm tracking-tight ${isLoss ? 'text-red-600' : 'text-sage-green'}`}>
                    {isLoss ? '-' : '+'} ₹{Math.abs(totalProfit).toFixed(2)}
                  </span>
                </div>
              </div>

              {isLoss && (
                <div className="bg-red-100 text-red-700 p-4 rounded-xl text-sm font-bold flex items-start gap-2">
                  ⚠️ Warning: You are selling below the cost price (CP: ₹{selectedProduct?.costPrice}). This transaction results in a loss.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {sales.length === 0 ? <div className="text-center py-12 text-gray-500 font-medium">No sales recorded yet.</div> : 
            sales.map((sale) => (
              <div key={sale.id} className="p-4 lg:p-5 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{sale.productName}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Qty: {sale.quantity} @ ₹{sale.unitPrice}/unit • {new Date(sale.date).toLocaleDateString()}
                  </p>
                  {sale.customerName && <p className="text-[11px] text-baltic-blue font-bold mt-1">👤 {sale.customerName}</p>}
                </div>
                
                <div className="flex items-center gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-base font-black text-gray-900 font-ibm tracking-tight">₹ {sale.totalAmount.toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-sage-green' : sale.paymentMethod === 'Online' ? 'bg-blue-100 text-rich-cerulean' : 'bg-orange-100 text-orange-600'}`}>
                      {sale.paymentMethod}
                    </span>
                  </div>
                  <button onClick={() => { shop && generateInvoicePdf(shop, sale); toast.success("Invoice downloaded!"); }} className="p-2.5 text-gray-500 hover:text-baltic-blue hover:bg-blue-50 rounded-xl transition shadow-sm border border-gray-200" title="Download Invoice">
                    <Download size={18} />
                  </button>
                  <button onClick={() => deleteSale(sale.id, sale.productId, sale.quantity)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100" title="Undo Sale">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}