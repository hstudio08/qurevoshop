"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, User, MapPin, CreditCard, ShieldCheck, PackageOpen } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import SecureInvoiceModal from "@/components/features/SecureInvoiceModal";

export default function SalesPage() {
  const { shop } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { addSale } = useSalesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Credit" | "">("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (shop?.id) fetchProducts(shop.id);
  }, [shop, fetchProducts]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.currentStock > 0
  );

const addToCart = (product: any) => {
    // 1. Check stock validity OUTSIDE the state updater
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem && existingItem.quantity >= product.currentStock) {
      toast.error("Insufficient stock limit reached!");
      return; // Stop execution here
    }

    // 2. Perform a pure state update
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
    // 1. Check stock validity OUTSIDE the state updater
    const itemToUpdate = cart.find(item => item.productId === productId);
    
    if (!itemToUpdate) return;

    const newQuantity = itemToUpdate.quantity + delta;

    if (newQuantity > itemToUpdate.maxStock) { 
      toast.error("Maximum available stock reached."); 
      return; 
    }
    if (newQuantity < 1) {
      return; 
    }

    // 2. Perform a pure state update
    setCart(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePreview = () => {
    if (cart.length === 0) return toast.error("Cart is empty.");
    if (!paymentMethod) return toast.error("Select a payment method.");
    if (paymentMethod === "Credit" && !customerName.trim()) {
      return toast.error("Customer Name required for Credit.");
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
      customerName: customerName || null,
      customerAddress: customerAddress || null,
      date: new Date(),
    };

    try {
      await addSale(shop.id, saleData, cart);
      toast.success("Transaction completed.");
      setCart([]); setCustomerName(""); setCustomerAddress(""); setPaymentMethod(""); setSearchQuery(""); setIsPreviewOpen(false);
    } catch (error) {
      toast.error("Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#F7F9FC] font-sans overflow-hidden text-gray-900">
      
      {/* LEFT: Professional Product Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        
        {/* Search Header */}
        <div className="p-5 bg-white border-b border-gray-200 shrink-0 flex items-center justify-between">
          <div className="relative w-full max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-gray-400" 
              autoFocus 
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#F7F9FC]">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <button 
                key={product.id} 
                onClick={() => addToCart(product)} 
                className="group flex flex-col justify-between text-left bg-white border border-gray-200 rounded-lg p-4 h-[120px] hover:border-blue-600 hover:shadow-sm active:bg-gray-50 transition-all"
              >
                <div className="w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 pr-2">{product.name}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${product.currentStock <= 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    Stock: {product.currentStock}
                  </span>
                </div>
                
                <div className="w-full flex justify-between items-end mt-2">
                  <p className="text-lg font-bold text-gray-900">₹{product.sellingPrice}</p>
                  <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-colors text-gray-400">
                    <Plus size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <PackageOpen size={40} strokeWidth={1.5} className="mb-3" />
              <p className="text-sm font-medium">No products match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: POS Checkout Register */}
      <div className="w-full lg:w-[420px] bg-white flex flex-col h-[50vh] lg:h-full z-10 shrink-0">
        
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-base font-bold text-gray-800">Current Order <span className="text-gray-400 font-normal ml-1">({totalItems})</span></h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-2 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={40} strokeWidth={1.5} className="mb-3" />
              <p className="text-sm">Scan or select items to begin</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cart.map(item => (
                <li key={item.productId} className="p-3 hover:bg-gray-50 flex justify-between items-center group transition-colors">
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">₹{item.unitPrice} / unit</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-sm font-bold text-gray-900">₹{(item.unitPrice * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"><Minus size={14}/></button>
                      <span className="w-8 text-center text-xs font-semibold text-gray-900 border-x border-gray-200 py-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"><Plus size={14}/></button>
                      <button onClick={() => removeFromCart(item.productId)} className="px-2 py-1 text-red-500 hover:bg-red-50 border-l border-gray-200 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Checkout Panel */}
        <div className="bg-gray-50 border-t border-gray-200 p-5 shrink-0">
          
          <div className="space-y-3 mb-5">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={paymentMethod === 'Credit' ? "Customer Name (Required)*" : "Customer Name (Optional)"} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={`w-full border rounded-md py-2.5 pl-10 pr-3 text-sm outline-none transition-all ${paymentMethod === 'Credit' && !customerName ? 'border-red-300 focus:ring-2 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'}`} />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Customer Address (Optional)" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full border border-gray-300 rounded-md py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all" />
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'Online', 'Credit'].map((method) => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method as any)} 
                  className={`py-2 rounded-md text-sm font-semibold border transition-all ${paymentMethod === method ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <p className="text-sm font-semibold text-gray-600">Total Due</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">₹{totalAmount.toLocaleString()}</p>
            </div>
            
            <button onClick={handlePreview} disabled={cart.length === 0} className="w-full bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base">
              <ShieldCheck size={20} /> Charge ₹{totalAmount.toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      <SecureInvoiceModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onConfirm={confirmSale} 
        cart={cart} 
        total={totalAmount} 
        paymentMethod={paymentMethod} 
        customerName={customerName} 
        customerAddress={customerAddress}
        shopDetails={shop} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}