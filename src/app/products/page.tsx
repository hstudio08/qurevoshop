"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Package, AlertTriangle, Trash2, PlusCircle, MinusCircle, MoreVertical, Edit2, Layers } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import ProductModal from "@/components/features/ProductModal";

export default function ProductsPage() {
  const { shop } = useAuthStore();
  const { products, isLoading, fetchProducts, updateProduct, deleteProduct } = useProductStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Low Stock" | "Out of Stock">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeActions, setActiveActions] = useState<string | null>(null);

  useEffect(() => {
    if (shop?.id) fetchProducts(shop.id);
  }, [shop, fetchProducts]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "Low Stock") return p.currentStock > 0 && p.currentStock <= 10;
    if (activeFilter === "Out of Stock") return p.currentStock === 0;
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
    try { await deleteProduct(id); toast.success("Deleted."); setActiveActions(null); } catch (error) { toast.error("Delete failed."); }
  };

  const adjustStock = async (id: string, current: number, change: number) => {
    const newStock = Math.max(0, current + change); 
    try { await updateProduct(id, { currentStock: newStock }); } catch (error) { toast.error("Stock update failed"); }
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 font-sans bg-slate-50 min-h-screen">
      
      {/* OPTIMIZED MOBILE HEADER
        - Removed pt-6 gap 
        - top-0 instead of top-[64px] (assumes parent layout handles its own scroll container cleanly)
        - Backdrop blur for clean scrolling 
      */}
      <div className="sticky top-0 z-30 pt-3 pb-3 sm:pt-6 sm:pb-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/50 -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
        
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
          
          {/* Desktop Add Button */}
          <button onClick={openAddModal} className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition active:scale-95">
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Search & Filters in a tight mobile row */}
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
          
          {/* Filter Chips - Horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 shrink-0">
            {["All", "Low Stock", "Out of Stock"].map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter as any)} 
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border shadow-sm ${activeFilter === filter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT LISTING */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Inventory...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400">
          <Package size={48} className="mb-4 opacity-30" />
          <p className="text-sm font-bold uppercase tracking-widest">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const hasImage = product.images && product.images.length > 0;
            const isLowStock = product.currentStock > 0 && product.currentStock <= 10;
            const isOut = product.currentStock === 0;

            return (
              <div key={product.id} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all overflow-hidden flex flex-col group">
                <div className="p-3 sm:p-4 flex items-center justify-between gap-3 flex-1">
                  
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 sm:gap-4 overflow-hidden flex-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative">
                      {hasImage ? <img src={product.images![0]} alt={product.name} className="w-full h-full object-cover" /> : <Package size={20} className="text-slate-300"/>}
                      {isLowStock && <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>}
                      {isOut && <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]"><AlertTriangle size={18} className="text-red-500 drop-shadow-md"/></div>}
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={product.name}>{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md ${isOut ? 'text-red-700 bg-red-100' : isLowStock ? 'text-orange-700 bg-orange-100' : 'text-emerald-700 bg-emerald-100'}`}>
                          STOCK: {product.currentStock}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] sm:text-xs font-bold text-slate-500">
                        <span>CP: ₹{product.costPrice}</span>
                        <span className="text-indigo-600 font-black">SP: ₹{product.sellingPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Actions */}
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

                {/* Expanded Action Drawer */}
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

      {/* MOBILE FLOATING ACTION BUTTON (Hidden on Desktop) */}
      <button onClick={openAddModal} className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-90 transition-all z-40">
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        shopId={shop?.id || ""} 
        editingProduct={editingProduct} 
      />
    </div>
  );
}