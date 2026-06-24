"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Package, AlertTriangle, Trash2, PlusCircle, MinusCircle, MoreVertical, Edit2, Layers, AlertOctagon, CalendarClock, X } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import ProductModal from "@/components/features/ProductModal";
import { ProductsPageSkeleton } from "@/components/ui/ProductsPageSkeleton";

export default function ProductsPage() {
  const { shop, user } = useAuthStore();
  const { products, isLoading, fetchProducts, updateProduct, deleteProduct } = useProductStore();
  
  const activeShopId = shop?.id || (shop as any)?.uid || user?.uid;
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Low Stock" | "Out of Stock" | "Expiring">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeActions, setActiveActions] = useState<string | null>(null);

  // Expiry Alert State
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeShopId) {
      fetchProducts(activeShopId);
    }
  }, [activeShopId, fetchProducts]);

  // --- EXPIRY LOGIC & ANTI-IRRITATION SYSTEM ---
  const expiringProducts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return products.filter(p => {
      if (!p.expiryDate) return false;
      const expDate = new Date(p.expiryDate);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // Anything expiring in 30 days or already expired
    }).sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
  }, [products]);

  // Show modal only ONCE per day
  useEffect(() => {
    if (mounted && !isLoading && expiringProducts.length > 0) {
      const todayStr = new Date().toDateString();
      const dismissedDate = localStorage.getItem("qurevo_expiry_alert_dismissed");
      
      if (dismissedDate !== todayStr) {
        // Slight delay so it pops up smoothly after the skeleton unveils
        const timer = setTimeout(() => setShowExpiryModal(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [mounted, isLoading, expiringProducts.length]);

  const handleDismissExpiryAlert = () => {
    localStorage.setItem("qurevo_expiry_alert_dismissed", new Date().toDateString());
    setShowExpiryModal(false);
  };

  const isPageLoading = !mounted || !activeShopId || isLoading;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "Low Stock") return p.currentStock > 0 && p.currentStock <= 10;
    if (activeFilter === "Out of Stock") return p.currentStock === 0;
    if (activeFilter === "Expiring") {
      if (!p.expiryDate) return false;
      const diffDays = Math.ceil((new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setActiveActions(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete product permanently?")) return;
    try { 
      await deleteProduct(id); 
      toast.success("Deleted."); 
      setActiveActions(null); 
    } catch (error) { 
      toast.error("Delete failed."); 
    }
  };

  const adjustStock = async (id: string, current: number, change: number) => {
    const newStock = Math.max(0, current + change); 
    try { 
      await updateProduct(id, { currentStock: newStock }); 
    } catch (error) { 
      toast.error("Stock update failed"); 
    }
  };

  if (isPageLoading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="pb-24 max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 pt-3 pb-3 sm:pt-6 sm:pb-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/50 -mx-3 px-3 sm:mx-0 sm:px-0 mb-4 transition-opacity animate-in fade-in duration-500">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 hidden sm:block">
              <Layers size={20} />
            </div>
            <div>
               <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">Catalog</h1>
               <p className="text-[11px] sm:text-sm text-slate-500 font-semibold mt-1">{products.length} Products</p>
            </div>
          </div>
          
          <button onClick={openAddModal} className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition active:scale-95">
            <Plus size={18} /> Add Product
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full text-sm font-medium border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all" 
            />
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 shrink-0">
            {["All", "Low Stock", "Out of Stock", "Expiring"].map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter as any)} 
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border shadow-sm flex items-center gap-1.5
                  ${activeFilter === filter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                  ${filter === "Expiring" && activeFilter !== "Expiring" ? 'text-orange-600 border-orange-200 bg-orange-50/50 hover:bg-orange-100' : ''}
                `}
              >
                {filter === "Expiring" && <AlertOctagon size={14} />}
                {filter}
                {filter === "Expiring" && expiringProducts.length > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md ml-1">{expiringProducts.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT LISTING */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 animate-in zoom-in-95 duration-500">
          <Package size={48} className="mb-4 opacity-30" />
          <p className="text-sm font-bold uppercase tracking-widest">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredProducts.map((product) => {
            const hasImage = product.images && product.images.length > 0;
            const isLowStock = product.currentStock > 0 && product.currentStock <= 10;
            const isOut = product.currentStock === 0;
            
            // Expiry Check for Card UI
            let expiryWarning = null;
            let isExpired = false;
            if (product.expiryDate) {
              const diffDays = Math.ceil((new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays < 0) {
                expiryWarning = "EXPIRED";
                isExpired = true;
              } else if (diffDays === 0) {
                expiryWarning = "EXPIRES TODAY";
              } else if (diffDays <= 7) {
                expiryWarning = `EXP IN ${diffDays} DAYS`;
              } else if (diffDays <= 30) {
                expiryWarning = `EXP IN ${diffDays} DAYS`;
              }
            }

            return (
              <div key={product.id} className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group ${isExpired ? 'border-red-300 bg-red-50/10' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="p-3 sm:p-4 flex items-center justify-between gap-3 flex-1">
                  
                  <div className="flex items-center gap-3 sm:gap-4 overflow-hidden flex-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative">
                      {hasImage ? <img src={product.images![0]} alt={product.name} className="w-full h-full object-cover" /> : <Package size={20} className="text-slate-300"/>}
                      {isLowStock && <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>}
                      {isOut && <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]"><AlertTriangle size={18} className="text-red-500 drop-shadow-md"/></div>}
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className={`text-sm sm:text-base font-bold truncate ${isExpired ? 'text-red-900' : 'text-slate-900'}`} title={product.name}>{product.name}</h3>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md ${isOut ? 'text-red-700 bg-red-100' : isLowStock ? 'text-orange-700 bg-orange-100' : 'text-emerald-700 bg-emerald-100'}`}>
                          STOCK: {product.currentStock}
                        </span>
                        
                        {/* EXPIRY BADGE ON CARD */}
                        {expiryWarning && (
                          <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${isExpired ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                            {expiryWarning}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-[10px] sm:text-xs font-bold text-slate-500">
                        <span>CP: ₹{product.costPrice}</span>
                        <span className="text-indigo-600 font-black">SP: ₹{product.sellingPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex flex-col items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200/60">
                      <button onClick={() => adjustStock(product.id, product.currentStock, 1)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors active:scale-90"><PlusCircle size={16}/></button>
                      <button onClick={() => adjustStock(product.id, product.currentStock, -1)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors active:scale-90"><MinusCircle size={16}/></button>
                    </div>
                    <button onClick={() => setActiveActions(activeActions === product.id ? null : product.id)} className="p-2.5 text-slate-400 hover:text-slate-900 bg-white rounded-xl hover:bg-slate-50 transition-colors">
                      <MoreVertical size={18}/>
                    </button>
                  </div>
                </div>

                {activeActions === product.id && (
                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-end gap-3 animate-in slide-in-from-top-2">
                    <button onClick={() => openEditModal(product)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-100 active:scale-95 transition-all"><Edit2 size={14}/> Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl shadow-sm hover:bg-red-100 active:scale-95 transition-all"><Trash2 size={14}/> Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button onClick={openAddModal} className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-90 transition-all z-40 animate-in zoom-in-95 duration-500">
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        shopId={activeShopId || ""} 
        editingProduct={editingProduct} 
      />

      {/* =========================================================================
          PROFESSIONAL EXPIRY ALERT MODAL (Anti-Irritation system active)
          ========================================================================= */}
      {showExpiryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 overflow-hidden relative">
            
            {/* Warning Header */}
            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white text-center shrink-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <AlertOctagon size={32} strokeWidth={2.5} className="text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Attention Required</h2>
              <p className="text-white/80 font-medium text-sm mt-1">You have {expiringProducts.length} product(s) expiring soon.</p>
            </div>

            {/* Expiring List Preview */}
            <div className="flex-1 overflow-y-auto p-2 bg-slate-50 custom-scrollbar">
              <div className="space-y-2 p-2">
                {expiringProducts.slice(0, 5).map(product => {
                  const diffDays = Math.ceil((new Date(product.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = diffDays < 0;
                  
                  return (
                    <div key={product.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                        <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                          <CalendarClock size={12}/> {new Date(product.expiryDate!).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 border ${isExpired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        {isExpired ? 'Expired' : `${diffDays} Days`}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {expiringProducts.length > 5 && (
                <p className="text-center text-xs font-bold text-slate-400 mt-2 mb-4 uppercase tracking-widest">
                  + {expiringProducts.length - 5} more items
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-slate-100 bg-white shrink-0">
              <button 
                onClick={() => {
                  handleDismissExpiryAlert();
                  setActiveFilter("Expiring");
                }} 
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] mb-2"
              >
                View Expiring Products
              </button>
              <button 
                onClick={handleDismissExpiryAlert} 
                className="w-full bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                Got it, dismiss for today
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}