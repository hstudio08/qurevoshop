"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, User, AlertTriangle, FileText, Eraser } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import InvoicePreview from "@/components/features/InvoicePreview";

export default function SalesPage() {
  const { shop } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { addSale } = useSalesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Credit" | "">("");
  const [customerName, setCustomerName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (shop?.id) fetchProducts(shop.id);
  }, [shop, fetchProducts]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.currentStock > 0);

  const addToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.productId === product.id);
      if (exists) {
        if (exists.quantity >= product.currentStock) {
          toast.error("Insufficient stock limit reached!");
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, productName: product.name, unitPrice: product.sellingPrice, costPrice: product.costPrice, quantity: 1, maxStock: product.currentStock }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQ = item.quantity + delta;
        if (newQ > item.maxStock) { toast.error("Maximum available stock reached."); return item; }
        if (newQ < 1) return item;
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePreview = () => {
    if (cart.length === 0) return toast.error("Cannot generate bill: Cart is empty.");
    if (!paymentMethod) return toast.error("A payment method must be selected.");
    if (paymentMethod === "Credit" && !customerName.trim()) {
      return toast.error("Customer Name is mandatory for Credit transactions.");
    }
    setIsPreviewOpen(true);
  };

  const confirmSale = async () => {
    if (!shop) return;
    setIsSubmitting(true);
    
    let totalProfit = 0;
    const saleItems = cart.map(item => {
      totalProfit += (item.unitPrice - item.costPrice) * item.quantity;
      return { productId: item.productId, productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, costPrice: item.costPrice };
    });

    const saleData = {
      shopId: shop.id,
      items: saleItems,
      totalAmount,
      profit: totalProfit,
      paymentMethod: paymentMethod as "Cash" | "Online" | "Credit",
      customerName: customerName || undefined,
      date: new Date(),
    };

    try {
      await addSale(shop.id, saleData, cart);
      toast.success("Transaction Secured & Recorded!");
      
      setCart([]);
      setCustomerName("");
      setPaymentMethod("");
      setSearchQuery("");
      setIsPreviewOpen(false);
    } catch (error) {
      toast.error("Failed to process transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden pb-16 lg:pb-0 w-full max-w-full">
      
      {/* LEFT COL: Products Panel */}
      <div className="flex-1 flex flex-col bg-[#f4f7f9] lg:border-r border-gray-200 h-[50vh] lg:h-full min-w-0">
        <div className="p-4 sm:p-6 bg-white border-b border-gray-100 shadow-sm z-10 shrink-0 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-2xl">
            <input type="text" placeholder="Search by product name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-sm border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-baltic-blue outline-none font-bold text-gray-800 shadow-inner" autoFocus />
            <Search size={18} className="absolute left-4 top-4 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start">
          {filteredProducts.map(product => (
            <button key={product.id} onClick={() => addToCart(product)} className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-baltic-blue hover:shadow-md active:scale-95 transition flex flex-col justify-between min-h-[100px] relative overflow-hidden">
              <div>
                <p className="text-sm font-black text-gray-900 leading-tight line-clamp-2">{product.name}</p>
                <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-widest ${product.currentStock <= 5 ? 'text-orange-500' : 'text-gray-400'}`}>
                  Stock: {product.currentStock}
                </p>
              </div>
              <p className="text-base font-black text-baltic-blue font-ibm mt-3">₹{product.sellingPrice}</p>
            </button>
          ))}
          {filteredProducts.length === 0 && <div className="col-span-full py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No products available in inventory</div>}
        </div>
      </div>

      {/* RIGHT COL: Cart & Checkout Ledger */}
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 bg-white flex flex-col h-[50vh] lg:h-full shadow-2xl z-20 relative">
        
        {/* Cart Header */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Cart ({totalItems} Items)</p>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md transition"><Eraser size={12}/> Clear</button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <ShoppingCart size={48} className="mb-3 text-gray-300"/>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.productId} className="bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center shadow-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 h-full w-1 bg-baltic-blue opacity-50"></div>
                  <div className="flex-1 min-w-0 pr-3 pl-2">
                    <h4 className="text-sm font-bold text-gray-900 truncate" title={item.productName}>{item.productName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-black text-gray-500 font-ibm">₹{item.unitPrice}</p>
                      <span className="text-gray-300 text-[10px]">•</span>
                      <p className="text-[10px] font-bold text-gray-400">Total: ₹{(item.unitPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200 shrink-0">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 text-gray-600 bg-white rounded shadow-sm hover:text-red-500 active:scale-90 transition"><Minus size={14} strokeWidth={3}/></button>
                    <span className="w-6 text-center text-sm font-black font-ibm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 text-baltic-blue bg-white rounded shadow-sm hover:text-rich-cerulean active:scale-90 transition"><Plus size={14} strokeWidth={3}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="ml-2 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Bottom Area */}
        <div className="bg-white border-t border-gray-100 p-5 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-30">
          
          <div className="mb-4">
             <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input type="text" placeholder={paymentMethod === 'Credit' ? "Customer Name (Mandatory for Credit)*" : "Customer Name (Optional)"} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`w-full border rounded-xl p-3 pl-10 text-sm font-bold outline-none transition-all shadow-sm ${paymentMethod === 'Credit' && !customerName ? 'border-orange-300 bg-orange-50 focus:ring-2 focus:ring-orange-500' : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-baltic-blue'}`} />
             </div>
          </div>

          <div className="mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between items-center">
              Payment Method 
              {!paymentMethod && <span className="text-red-500 normal-case tracking-normal text-[10px] flex items-center gap-1"><AlertTriangle size={12}/> Required</span>}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setPaymentMethod("Cash")} className={`py-3 rounded-xl text-sm font-black border transition-all ${paymentMethod === "Cash" ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}>Cash</button>
              <button onClick={() => setPaymentMethod("Online")} className={`py-3 rounded-xl text-sm font-black border transition-all ${paymentMethod === "Online" ? 'bg-rich-cerulean border-rich-cerulean text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}>Online</button>
              <button onClick={() => setPaymentMethod("Credit")} className={`py-3 rounded-xl text-sm font-black border transition-all ${paymentMethod === "Credit" ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}>Credit</button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
            <div className="shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Grand Total</p>
              <p className="text-3xl font-black text-gray-900 font-ibm leading-none">₹{totalAmount.toLocaleString()}</p>
            </div>
            
            <button onClick={handlePreview} className="flex-1 bg-gradient-to-r from-baltic-blue to-[#087ca8] text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(5,102,141,0.3)] hover:-translate-y-0.5 transition active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
              <FileText size={18} /> Preview Bill
            </button>
          </div>

        </div>
      </div>

      <InvoicePreview 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onConfirm={confirmSale} 
        cart={cart} 
        total={totalAmount} 
        paymentMethod={paymentMethod} 
        customerName={customerName} 
        shopDetails={shop} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}