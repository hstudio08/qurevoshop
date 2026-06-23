"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Package, AlertTriangle, Trash2, PlusCircle, MinusCircle, MoreVertical, Edit2 } from "lucide-react";
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
    // CHANGED: Expanded max-w-md to max-w-5xl for proper desktop usage
    <div className="pb-24 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header & Controls */}
      <div className="sticky top-[64px] lg:top-0 bg-[#f4f7f9] z-20 pt-6 pb-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
             <h1 className="text-2xl font-black text-gray-900 tracking-tight">Catalog</h1>
             <p className="text-sm text-gray-500 font-medium">{products.length} Unique Products</p>
          </div>
          
          {/* CHANGED: Re-added explicit Desktop Button */}
          <button onClick={openAddModal} className="hidden sm:flex items-center gap-2 bg-baltic-blue text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-rich-cerulean transition active:scale-95">
            <Plus size={18} /> Add New Product
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <input type="text" placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-sm border border-gray-200 rounded-2xl pl-11 pr-4 py-3 bg-white focus:ring-2 focus:ring-baltic-blue outline-none shadow-sm font-medium" />
            <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          </div>
          
          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {["All", "Low Stock", "Out of Stock"].map(filter => (
              <button key={filter} onClick={() => setActiveFilter(filter as any)} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${activeFilter === filter ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHANGED: Converted to Responsive Grid for Desktop */}
      {isLoading ? <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-8">Loading...</div> : 
        filteredProducts.length === 0 ? <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-8">No products found.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
          {filteredProducts.map((product) => {
            const hasImage = product.images && product.images.length > 0;
            const isLowStock = product.currentStock > 0 && product.currentStock <= 10;
            const isOut = product.currentStock === 0;

            return (
              <div key={product.id} className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="p-3.5 flex items-center justify-between gap-3 flex-1">
                  
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden relative">
                      {hasImage ? <img src={product.images![0]} alt={product.name} className="w-full h-full object-cover" /> : <Package size={20} className="text-gray-300"/>}
                      {isLowStock && <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>}
                      {isOut && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><AlertTriangle size={18} className="text-red-500"/></div>}
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate leading-tight" title={product.name}>{product.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[10px] font-bold text-gray-500">
                        <span className={`bg-gray-50 px-1.5 py-0.5 rounded border ${isOut ? 'text-red-600 border-red-100 bg-red-50' : isLowStock ? 'text-orange-600 border-orange-100 bg-orange-50' : 'text-sage-green border-green-100 bg-green-50'}`}>
                          Qty: {product.currentStock}
                        </span>
                        <span className="font-ibm">CP ₹{product.costPrice}</span>
                        <span className="text-baltic-blue font-ibm">SP ₹{product.sellingPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                      <button onClick={() => adjustStock(product.id, product.currentStock, 1)} className="p-1 text-gray-400 hover:text-sage-green active:scale-90"><PlusCircle size={16}/></button>
                      <button onClick={() => adjustStock(product.id, product.currentStock, -1)} className="p-1 text-gray-400 hover:text-red-500 active:scale-90"><MinusCircle size={16}/></button>
                    </div>
                    <button onClick={() => setActiveActions(activeActions === product.id ? null : product.id)} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-lg">
                      <MoreVertical size={18}/>
                    </button>
                  </div>
                </div>

                {/* Expanded Action Drawer */}
                {activeActions === product.id && (
                  <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-100 flex justify-end gap-3 animate-in slide-in-from-top-2">
                    <button onClick={() => openEditModal(product)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50 active:scale-95"><Edit2 size={14}/> Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg shadow-sm hover:bg-red-100 active:scale-95"><Trash2 size={14}/> Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MOBILE FLOATING ACTION BUTTON (Hidden on Desktop) */}
      <button onClick={openAddModal} className="sm:hidden fixed bottom-20 right-5 w-14 h-14 bg-baltic-blue text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(5,102,141,0.4)] hover:bg-[#087ca8] active:scale-90 transition-transform duration-200 z-40">
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