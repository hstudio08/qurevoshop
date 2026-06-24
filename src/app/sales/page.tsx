"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, User, MapPin, CreditCard, ShieldCheck, PackageOpen, Banknote, ShieldAlert, Download, X, Store, Phone, FileText, CheckCircle2, Receipt } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SalesPage() {
  const { shop, user } = useAuthStore();
  const { products, fetchProducts, updateProduct } = useProductStore();
  const { addSale, sales, fetchSales } = useSalesStore();

  const activeShopId = shop?.id || (shop as any)?.uid || user?.uid;

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Credit" | "">("");
  
  // Customer Details State
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceNeeded, setInvoiceNeeded] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [completedSale, setCompletedSale] = useState<any>(null);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeShopId) {
      fetchProducts(activeShopId);
      if (fetchSales) fetchSales(activeShopId);
    }
  }, [activeShopId, fetchProducts, fetchSales]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueCustomers = useMemo(() => {
    if (!sales) return [];
    const names = sales.map(s => s.customerName).filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [sales]);

  const customerSuggestions = useMemo(() => {
    if (!customerName) return [];
    return uniqueCustomers.filter(c => c.toLowerCase().includes(customerName.toLowerCase()));
  }, [customerName, uniqueCustomers]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.currentStock > 0
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem && existingItem.quantity >= product.currentStock) {
      toast.error("Insufficient stock limit reached!");
      return; 
    }

    setCart(prev => {
      if (existingItem) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        productName: product.name, 
        unitPrice: product.sellingPrice, 
        costPrice: product.costPrice, 
        quantity: 1, 
        maxStock: product.currentStock 
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const itemToUpdate = cart.find(item => item.productId === productId);
    if (!itemToUpdate) return;

    const newQuantity = itemToUpdate.quantity + delta;
    if (newQuantity > itemToUpdate.maxStock) { 
      toast.error("Maximum available stock reached."); 
      return; 
    }
    if (newQuantity < 1) return; 

    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const clearCart = () => setCart([]);

  const handlePreview = () => {
    if (cart.length === 0) return toast.error("Cart is empty.");
    if (!paymentMethod) return toast.error("Select a payment method.");
    
    // STRICT VALIDATION FOR INVOICES & CREDIT
    if (invoiceNeeded) {
      if (!customerName.trim() || !customerAddress.trim() || !customerPhone.trim()) {
        return toast.error("Name, Phone, and Address are required for an Official Invoice.");
      }
    } else if (paymentMethod === "Credit" && !customerName.trim()) {
      return toast.error("Customer Name is required for Credit sales.");
    }

    setIsPreviewOpen(true);
  };

  const confirmSale = async () => {
    if (!activeShopId) {
      toast.error("Account validation error. Please refresh.");
      return;
    }

    setIsSubmitting(true);
    
    let totalProfit = 0;
    const saleItems = cart.map(item => {
      totalProfit += (item.unitPrice - item.costPrice) * item.quantity;
      return { productId: item.productId, productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, costPrice: item.costPrice };
    });

    const saleData = {
      id: `SALE-${Date.now()}`,
      shopId: activeShopId,
      items: saleItems,
      totalAmount,
      profit: totalProfit,
      paymentMethod: paymentMethod as "Cash" | "Online" | "Credit",
      customerName: customerName || null,
      customerAddress: customerAddress || null,
      customerPhone: customerPhone || null, // Saved for invoice & directory
      invoiceGenerated: invoiceNeeded,
      date: new Date().toISOString(), 
    };

    try {
      await addSale(activeShopId, saleData, cart);

      for (const item of cart) {
        await updateProduct(item.productId, { currentStock: item.maxStock - item.quantity });
      }

      toast.success("Transaction completed.");
      setCompletedSale(saleData); 
      setCart([]); setCustomerName(""); setCustomerAddress(""); setCustomerPhone(""); setPaymentMethod(""); setSearchQuery(""); setInvoiceNeeded(false); setIsPreviewOpen(false);
    } catch (error) {
      console.error("Sale Error:", error);
      toast.error("Transaction failed. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-0px)] flex flex-col lg:flex-row bg-slate-50 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px] font-sans overflow-hidden pb-24 lg:pb-0">
      
      {/* LEFT: POS Checkout Register */}
      <div className="w-full lg:w-[420px] xl:w-[460px] bg-white/90 backdrop-blur-md flex flex-col h-[55vh] lg:h-full z-20 shrink-0 border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Customer Details & Invoice Toggle Section */}
        <div className="p-4 border-b border-slate-100 bg-white shrink-0 relative" ref={suggestionRef}>
          
          {/* Invoice Needed Toggle */}
          <div className="flex items-center gap-2 mb-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 cursor-pointer" onClick={() => setInvoiceNeeded(!invoiceNeeded)}>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${invoiceNeeded ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 bg-white'}`}>
              {invoiceNeeded && <ShieldCheck size={14} />}
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest select-none flex items-center gap-1.5">
               Generate Official Invoice <FileText size={14} className="text-indigo-400"/>
            </span>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${invoiceNeeded || paymentMethod === 'Credit' ? 'text-indigo-500' : 'text-slate-400'}`} />
              <input 
                type="text" 
                placeholder={invoiceNeeded || paymentMethod === 'Credit' ? "Customer Name (Required)*" : "Customer Name (Optional)"} 
                value={customerName} 
                onChange={(e) => { setCustomerName(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-3 text-sm font-bold outline-none transition-all ${(invoiceNeeded || paymentMethod === 'Credit') && !customerName ? 'border-red-300 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} 
              />
              
              {showSuggestions && customerSuggestions.length > 0 && customerName && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                  {customerSuggestions.map((name, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => e.preventDefault()} 
                      onClick={() => { setCustomerName(name); setShowSuggestions(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-50 last:border-0"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Phone size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${invoiceNeeded ? 'text-indigo-500' : 'text-slate-400'}`} />
                <input 
                  type="tel" 
                  placeholder={invoiceNeeded ? "Phone (Required)*" : "Phone (Optional)"} 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition-all ${invoiceNeeded && !customerPhone ? 'border-red-300 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} 
                />
              </div>
              
              <div className="relative">
                <MapPin size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${invoiceNeeded ? 'text-indigo-500' : 'text-slate-400'}`} />
                <input 
                  type="text" 
                  placeholder={invoiceNeeded ? "Address (Required)*" : "Address (Optional)"} 
                  value={customerAddress} 
                  onChange={(e) => setCustomerAddress(e.target.value)} 
                  className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition-all ${invoiceNeeded && !customerAddress ? 'border-red-300 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50 custom-scrollbar">
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Order ({totalItems})</h2>
            {cart.length > 0 && <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Clear All</button>}
          </div>

          {cart.length === 0 ? (
            <div className="h-[80%] flex flex-col items-center justify-center text-slate-400 opacity-60">
              <ShoppingCart size={40} strokeWidth={1.5} className="mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productId} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-sm group">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-slate-800 truncate leading-tight">{item.productName}</h4>
                    <p className="text-[11px] font-black text-indigo-600 mt-0.5">₹{item.unitPrice}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-sm font-black text-slate-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="px-2 py-1 text-slate-500 hover:bg-white transition-colors active:scale-95"><Minus size={14}/></button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="px-2 py-1 text-slate-500 hover:bg-white transition-colors active:scale-95"><Plus size={14}/></button>
                      <button onClick={() => removeFromCart(item.productId)} className="px-2 py-1 text-red-400 hover:bg-red-50 hover:text-red-600 border-l border-slate-200 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border-t border-slate-200 p-4 shrink-0">
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'Online', 'Credit'] as const).map((method) => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method)} 
                  className={`py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${paymentMethod === method ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {method === "Cash" && <Banknote size={16} />}
                  {method === "Online" && <CreditCard size={16} />}
                  {method === "Credit" && <User size={16} />}
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grand Total</span>
              <span className="text-4xl font-black text-emerald-600 tracking-tighter leading-none">₹{totalAmount.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={handlePreview} 
              disabled={cart.length === 0} 
              className="w-full bg-indigo-600 disabled:bg-slate-300 disabled:active:scale-100 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
            >
              <ShieldCheck size={20} /> Preview & Charge
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Professional Product Grid */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <div className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0 sticky top-0 z-30">
          <div className="relative w-full max-w-2xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search inventory to add..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 max-w-7xl mx-auto">
            {filteredProducts.map(product => {
              const inCart = cart.find(i => i.productId === product.id)?.quantity || 0;
              const remainingStock = product.currentStock - inCart;

              return (
                <div 
                  key={product.id} 
                  onClick={() => remainingStock > 0 ? addToCart(product) : null} 
                  className={`bg-white border-2 rounded-2xl p-3 flex flex-col justify-between h-[115px] transition-all select-none ${remainingStock > 0 ? 'border-slate-100 hover:border-indigo-400 cursor-pointer shadow-sm hover:shadow-md active:scale-95' : 'border-red-100 bg-red-50/30 opacity-70 cursor-not-allowed'}`}
                >
                  <div>
                    <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 pr-1">{product.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-wider mt-1 ${remainingStock <= 5 ? 'text-orange-600' : 'text-slate-400'}`}>
                      {remainingStock} IN STOCK
                    </p>
                  </div>
                  
                  <div className="w-full flex justify-between items-end mt-2">
                    <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                      ₹{product.sellingPrice}
                    </span>
                    
                    {remainingStock > 0 ? (
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
                        <Plus size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">OUT</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 pb-20">
              <PackageOpen size={48} strokeWidth={1.5} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No products match search</p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE PREVIEW MODAL */}
      <SecureInvoiceModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onConfirm={confirmSale} 
        cart={cart} 
        total={totalAmount} 
        paymentMethod={paymentMethod as any} 
        customerName={customerName} 
        customerAddress={customerAddress}
        customerPhone={customerPhone}
        invoiceNeeded={invoiceNeeded}
        shopDetails={shop} 
        isSubmitting={isSubmitting} 
      />

      {/* FINAL A4 GENERATOR MODAL */}
      {completedSale && (
        <PostSaleInvoiceModal 
          sale={completedSale}
          shopDetails={shop}
          onClose={() => setCompletedSale(null)}
        />
      )}

    </div>
  );
}

/* =====================================================================
   MOBILE PREVIEW MODAL (INLINE COMPONENT FOR SALES PAGE)
======================================================================== */

function SecureInvoiceModal({
  isOpen, onClose, onConfirm, cart, total, paymentMethod, customerName, customerAddress, customerPhone, invoiceNeeded, shopDetails, isSubmitting
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden relative">
        
        <div className="flex justify-between items-center p-3 border-b border-slate-100 shrink-0 bg-slate-50">
          <h2 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <Receipt size={14} /> Order Preview
          </h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed From</p>
            <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Store size={12} className="text-slate-400"/> {shopDetails?.shopName || "Store Name"}
            </p>
            <p className="text-[11px] font-semibold text-slate-700">{shopDetails?.ownerName}</p>
            {shopDetails?.shopAddress && <p className="text-[10px] font-medium text-slate-500 leading-snug">{shopDetails.shopAddress}</p>}
            {(shopDetails?.state || shopDetails?.pincode) && (
              <p className="text-[10px] font-medium text-slate-500">{shopDetails?.state} {shopDetails?.pincode}</p>
            )}
            {shopDetails?.mobileNumber && <p className="text-[10px] font-medium text-slate-500">Ph: {shopDetails.mobileNumber}</p>}
          </div>

          {(customerName || customerAddress || customerPhone) && (
            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-1.5">
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center justify-between">
                Billed To
                {invoiceNeeded && <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[8px]">OFFICIAL INVOICE</span>}
              </p>
              {customerName && <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><User size={12} className="text-indigo-400"/> {customerName}</p>}
              {customerPhone && <p className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5"><Phone size={12} className="text-indigo-400"/> {customerPhone}</p>}
              {customerAddress && <p className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5"><MapPin size={12} className="text-indigo-400"/> {customerAddress}</p>}
            </div>
          )}

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
            
            <div className="mt-6 flex justify-center opacity-40">
              <img src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" alt="Qurevo" className="h-3.5 object-contain grayscale" />
            </div>
          </div>
        </div>

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
            <button onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-xl hover:bg-slate-100 transition active:scale-95 disabled:opacity-50">
              Edit
            </button>
            <button onClick={onConfirm} disabled={isSubmitting} className="flex-[2] py-2.5 bg-indigo-600 text-white text-[11px] font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50">
              {isSubmitting ? "Processing..." : <><CheckCircle2 size={14} /> Confirm Sale</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* =====================================================================
   POST-SALE FINAL A4 INVOICE GENERATOR
======================================================================== */

interface PostSaleInvoiceProps {
  sale: any;
  shopDetails: any; 
  onClose: () => void;
}

function PostSaleInvoiceModal({ sale, shopDetails, onClose }: PostSaleInvoiceProps) {
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
        author: shopDetails?.shopName || 'Qurevo Shops',
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
  const formattedDate = saleDateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-900/80 backdrop-blur-sm font-sans">
      
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-2 text-emerald-400 font-bold px-2 text-xs uppercase tracking-widest hidden sm:flex">
          <ShieldCheck size={16} /> Sale Successful - Receipt Ready
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <button onClick={generatePDF} disabled={isGenerating} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50">
            <Download size={16} /> {isGenerating ? "Securing PDF..." : "Download PDF"}
          </button>
          <button onClick={onClose} className="p-2.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><X size={20}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800/50 p-4 sm:p-8 flex justify-center items-start custom-scrollbar">
        
        <div ref={invoiceRef} className="w-[794px] min-h-[1123px] shrink-0 bg-white relative shadow-2xl flex flex-col">
          
          <div className="h-3 w-full bg-slate-900 shrink-0"></div>
          
          <div className="p-16 flex-1 flex flex-col">
            
            <div className="flex justify-between items-start mb-12 border-b border-slate-200 pb-10">
              <div className="max-w-[350px]">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-3">
                  {shopDetails?.shopName || 'Store Name'}
                </h1>
                
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">{shopDetails?.ownerName}</p>
                  {shopDetails?.shopAddress && <p>{shopDetails.shopAddress}</p>}
                  {(shopDetails?.state || shopDetails?.pincode) && (
                    <p>{shopDetails?.state} {shopDetails?.pincode}</p>
                  )}
                  {shopDetails?.mobileNumber && <p className="mt-2 text-slate-700">P: {shopDetails.mobileNumber}</p>}
                  {shopDetails?.email && <p className="text-slate-700">E: {shopDetails.email}</p>}
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-4xl font-light text-slate-300 tracking-widest mb-6">
                  {sale.invoiceGenerated ? "INVOICE" : "RECEIPT"}
                </h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-0.5">Invoice Date</p>
                    <p className="font-bold text-slate-800">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-0.5">Invoice Number</p>
                    <p className="font-bold text-slate-800">INV-{cryptoHash.substring(0,8)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Billed To</p>
                <h3 className="text-lg font-bold text-slate-900">{sale.customerName || "Walk-in Customer"}</h3>
                {sale.customerPhone && <p className="text-sm text-slate-500 mt-1">Ph: {sale.customerPhone}</p>}
                {sale.customerAddress && <p className="text-sm text-slate-500 mt-1">{sale.customerAddress}</p>}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-md border border-slate-200 inline-block">
                  {sale.paymentMethod}
                </p>
              </div>
            </div>

            <table className="w-full text-sm mb-12">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="text-left py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Description</th>
                  <th className="text-center py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Qty</th>
                  <th className="text-right py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Unit Price</th>
                  <th className="text-right py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4 font-semibold text-slate-800">{item.productName}</td>
                    <td className="py-4 text-center text-slate-600 font-medium">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600">₹{item.unitPrice.toLocaleString()}</td>
                    <td className="py-4 text-right font-bold text-slate-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-16">
              <div className="w-72">
                <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-100 mb-2">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{sale.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-wider">Total Due</span>
                  <span className="text-2xl font-black text-slate-900">₹{sale.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex-1"></div>

            <div className="border-t border-slate-200 pt-8 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase mb-6">
                Integrity Hash: {cryptoHash}
              </p>
              
              <div className="flex flex-col items-center opacity-60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Powered By</p>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" 
                    alt="Qurevo Logo" 
                    className="h-5 object-contain grayscale"
                  />
                  <span className="text-sm font-black text-slate-800 tracking-tight">Qurevo Shops</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}