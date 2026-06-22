"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, FileText, Plus, Banknote, CreditCard, User, Trash2, MapPin, Download, ChevronDown, Package } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSalesStore } from "@/store/useSalesStore";
import { recordSaleToDB } from "@/lib/firebase/saleService";
import { generateInvoicePdf } from "@/components/features/InvoiceGenerator";
import { SaleItem } from "@/types";
import toast from "react-hot-toast";

export default function SalesPage() {
  const { shop } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { sales, fetchSales, deleteSale, isLoading } = useSalesStore();
  
  const [activeTab, setActiveTab] = useState<"new" | "list">("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchLimit, setFetchLimit] = useState(20);

  // --- CART STATE ---
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [tempQty, setTempQty] = useState(1);
  const [tempPrice, setTempPrice] = useState(""); 
  
  // --- INVOICE STATE ---
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Credit">("Cash");
  const [wantInvoice, setWantInvoice] = useState(false);

  useEffect(() => {
    if (shop?.id) {
      if (products.length === 0) fetchProducts(shop.id);
      fetchSales(shop.id, fetchLimit);
    }
  }, [shop, fetchProducts, fetchSales, products.length, fetchLimit]);

  // Cart Management
  const selectedProduct = products.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setTempPrice(selectedProduct.sellingPrice.toString());
      setTempQty(1);
    }
  }, [selectedProductId, selectedProduct]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (tempQty > selectedProduct.currentStock) return toast.error(`Only ${selectedProduct.currentStock} in stock!`);
    
    // Check if already in cart
    const existing = cart.find(item => item.productId === selectedProduct.id);
    if (existing) {
      if (existing.quantity + tempQty > selectedProduct.currentStock) return toast.error("Stock exceeded!");
      setCart(cart.map(item => item.productId === selectedProduct.id ? { ...item, quantity: item.quantity + tempQty, unitPrice: Number(tempPrice) } : item));
    } else {
      setCart([...cart, { productId: selectedProduct.id, productName: selectedProduct.name, quantity: tempQty, unitPrice: Number(tempPrice), costPrice: selectedProduct.costPrice }]);
    }
    
    setSelectedProductId(""); setTempPrice(""); setTempQty(1);
  };

  const removeFromCart = (productId: string) => setCart(cart.filter(item => item.productId !== productId));

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const cartProfit = cart.reduce((sum, item) => sum + ((item.unitPrice - item.costPrice) * item.quantity), 0);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error("Cart is empty!");
    if (!shop) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Processing transaction...");
    try {
      const invNumber = `INV-${shop.mobileNumber.slice(-4)}-${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      const saleData = {
        totalAmount: cartTotal,
        profit: cartProfit,
        customerName: customerName || undefined,
        customerAddress: wantInvoice ? customerAddress : undefined,
        paymentMethod,
        invoiceNumber: invNumber
      };

      const recordedSale = await recordSaleToDB(shop.id, cart, saleData);
      
      if (wantInvoice) {
        await generateInvoicePdf(shop, recordedSale as any);
        toast.success("Sale recorded & Invoice downloaded!", { id: loadingToast });
      } else {
        toast.success("Sale recorded successfully!", { id: loadingToast });
      }
      
      // Reset
      setCart([]); setCustomerName(""); setCustomerAddress(""); setWantInvoice(false);
      fetchProducts(shop.id); fetchSales(shop.id, fetchLimit);
    } catch (error) {
      toast.error("Transaction failed.", { id: loadingToast });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col min-h-screen p-3 sm:p-5 lg:p-8 font-sans">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-bebas tracking-wide">Sales & Billing POS</h1>
        <p className="text-[11px] sm:text-sm text-gray-500">Add multiple items to cart and generate secure invoices.</p>
      </header>

      <div className="flex gap-2 mb-6 max-w-sm">
        <button onClick={() => setActiveTab("new")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${activeTab === "new" ? "bg-baltic-blue text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}>
          <ShoppingCart size={16} /> New Bill
        </button>
        <button onClick={() => setActiveTab("list")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${activeTab === "list" ? "bg-baltic-blue text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}>
          <FileText size={16} /> History
        </button>
      </div>

      {activeTab === "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Cart Builder */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-5 font-bebas tracking-wider">Add to Cart</h3>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-baltic-blue outline-none text-gray-900 font-bold">
                <option value="" disabled>Search & Select a product...</option>
                {products.map(p => <option key={p.id} value={p.id} disabled={p.currentStock === 0}>{p.name} - ₹{p.sellingPrice} ({p.currentStock} left)</option>)}
              </select>

              {selectedProduct && (
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <input type="number" min="1" value={tempQty} onChange={(e) => setTempQty(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold text-center outline-none" placeholder="Qty" />
                  </div>
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-3.5 text-gray-400 font-bold font-ibm">₹</span>
                    <input type="number" step="0.01" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 pl-8 text-sm font-bold font-ibm outline-none focus:border-baltic-blue" placeholder="Price/Unit" />
                  </div>
                  <button type="button" onClick={handleAddToCart} className="col-span-5 bg-sage-green/10 text-sage-green border border-sage-green/20 hover:bg-sage-green hover:text-white transition font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Plus size={18}/> Add to Bill
                  </button>
                </div>
              )}
            </div>

            {/* Cart Display */}
            <h3 className="text-sm font-bold text-gray-900 mb-3 font-bebas tracking-wider">Current Bill Items</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-100 min-h-[150px] p-3 space-y-2">
              {cart.length === 0 ? <p className="text-center text-xs text-gray-400 mt-12 font-bold uppercase">Cart is empty</p> : 
                cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{item.productName}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{item.quantity} units @ ₹{item.unitPrice}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-900 font-ibm">₹{(item.quantity * item.unitPrice).toFixed(2)}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
            <form onSubmit={handleRecordSale} className="space-y-5">
              
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-baltic-blue uppercase tracking-widest mb-1">Grand Total</p>
                  <p className="text-xs text-blue-400 font-bold">{cart.length} items in cart</p>
                </div>
                <p className="text-3xl font-black text-baltic-blue font-ibm tracking-tight">₹{cartTotal.toLocaleString()}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition">
                  <input type="checkbox" checked={wantInvoice} onChange={(e) => setWantInvoice(e.target.checked)} className="w-4 h-4 text-baltic-blue rounded focus:ring-baltic-blue" />
                  <span className="text-sm font-bold text-gray-700">Generate Secure PDF Invoice</span>
                </label>

                <div className="grid grid-cols-1 gap-3">
                  <input type="text" placeholder="Customer Name (Optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-baltic-blue font-medium" />
                  {wantInvoice && <input type="text" placeholder="Customer Address (Optional)" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-baltic-blue font-medium animate-in fade-in" />}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPaymentMethod("Cash")} className={`py-3 rounded-xl text-xs font-bold transition border flex flex-col items-center gap-1 ${paymentMethod === "Cash" ? "bg-green-50 border-sage-green text-sage-green shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><Banknote size={18} /> Cash</button>
                  <button type="button" onClick={() => setPaymentMethod("Online")} className={`py-3 rounded-xl text-xs font-bold transition border flex flex-col items-center gap-1 ${paymentMethod === "Online" ? "bg-blue-50 border-rich-cerulean text-rich-cerulean shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><CreditCard size={18} /> Online</button>
                  <button type="button" onClick={() => setPaymentMethod("Credit")} className={`py-3 rounded-xl text-xs font-bold transition border flex flex-col items-center gap-1 ${paymentMethod === "Credit" ? "bg-orange-50 border-orange-500 text-orange-500 shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}><User size={18} /> Credit</button>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full bg-baltic-blue text-white font-black py-4 rounded-xl shadow-md hover:bg-rich-cerulean transition active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 mt-4">
                {isSubmitting ? "Processing..." : wantInvoice ? <><FileText size={18}/> Checkout & Print Invoice</> : "Complete Checkout"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History List with Pagination */}
      {activeTab === "list" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {sales.length === 0 ? <div className="text-center py-12 text-gray-500 font-bold text-xs uppercase tracking-widest">No sales recorded yet.</div> : 
              sales.map((sale) => (
                <div key={sale.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2.5 rounded-lg text-gray-500 hidden sm:block"><Package size={18}/></div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {sale.items?.length > 1 ? `${sale.items.length} Items Purchased` : sale.items?.[0]?.productName || "Product Sale"}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                        {sale.invoiceNumber || sale.id.substring(0,8)} • {new Date(sale.date).toLocaleDateString()}
                      </p>
                      {sale.customerName && <p className="text-[11px] text-baltic-blue font-bold mt-1">👤 {sale.customerName}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-base font-black text-gray-900 font-ibm tracking-tight">₹ {sale.totalAmount.toLocaleString()}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                        ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-sage-green' : sale.paymentMethod === 'Online' ? 'bg-blue-100 text-rich-cerulean' : 'bg-orange-100 text-orange-600'}`}>
                        {sale.paymentMethod}
                      </span>
                    </div>
                    
                    <button onClick={async () => { shop && await generateInvoicePdf(shop, sale); toast.success("Invoice generated!"); }} className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-baltic-blue hover:border-blue-200 rounded-xl transition shadow-sm" title="Download Invoice">
                      <Download size={18} />
                    </button>
                    <button onClick={() => deleteSale(sale.id, sale.items)} className="p-2.5 bg-white border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-200 rounded-xl transition shadow-sm" title="Undo Sale">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
          
          {/* Pagination Load More */}
          {!isLoading && sales.length >= fetchLimit && (
             <div className="p-4 bg-gray-50 flex justify-center border-t border-gray-100">
               <button onClick={() => setFetchLimit(prev => prev === 20 ? 50 : prev === 50 ? 100 : prev + 100)} className="bg-white border border-gray-300 px-6 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-baltic-blue transition shadow-sm flex items-center gap-2">
                 <ChevronDown size={14}/> Load Older Sales
               </button>
             </div>
          )}
          {isLoading && <div className="p-4 text-center text-xs text-gray-400 font-bold uppercase">Loading data...</div>}
        </div>
      )}
    </div>
  );
}