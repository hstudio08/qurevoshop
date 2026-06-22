"use client";

import { useEffect, useState } from "react";
import { 
  Search, Plus, ShoppingBag, Package, AlertTriangle, 
  Ban, Edit, Trash2, X, PlusCircle, MinusCircle 
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const { shop } = useAuthStore();
  const { products, isLoading, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    costPrice: "",
    sellingPrice: "",
    currentStock: ""
  });

  // Fetch real data on load
  useEffect(() => {
    if (shop?.id) {
      fetchProducts(shop.id);
    }
  }, [shop, fetchProducts]);

  // Analytics
  const totalProducts = products.length;
  const inStock = products.filter(p => p.currentStock > 10).length;
  const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= 10).length;
  const outOfStock = products.filter(p => p.currentStock === 0).length;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", costPrice: "", sellingPrice: "", currentStock: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name, 
      costPrice: product.costPrice.toString(), 
      sellingPrice: product.sellingPrice.toString(), 
      currentStock: product.currentStock.toString() 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsSubmitting(true);
    
    const payload = {
      name: formData.name,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      currentStock: Number(formData.currentStock),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success("Product updated successfully!");
      } else {
        await addProduct(shop.id, payload);
        toast.success("Product added successfully!");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingProduct ? "Failed to update product" : "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product permanently?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

const quickStockAdjust = async (id: string, current: number, change: number) => {
    const action = change > 0 ? "Add 1 to" : "Remove 1 from";
    if (!window.confirm(`Agree to ${action} stock?`)) return; // <-- Agreement added

    const newStock = Math.max(0, current + change); 
    try { 
      await updateProduct(id, { currentStock: newStock }); 
    } catch (error) { 
      toast.error("Stock update failed"); 
    }
  };

  // Real-time margin calculation for the UI
  const margin = Number(formData.sellingPrice) - Number(formData.costPrice);

  return (
    <div className="flex flex-col min-h-screen p-4 lg:p-8 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Products & Inventory</h1>
          <p className="text-sm text-gray-500">Manage your shop catalog and track stock levels</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-baltic-blue text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-rich-cerulean transition active:scale-95"
        >
          <Plus size={18} /> <span className="hidden sm:inline">Add Product</span>
        </button>
      </header>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="bg-blue-50 text-rich-cerulean p-3 rounded-xl"><ShoppingBag size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Catalog</p>
            <p className="text-xl font-black text-gray-900">{totalProducts}</p>
          </div>
        </div>
        <div className="bg-white border border-green-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="bg-green-50 text-sage-green p-3 rounded-xl"><Package size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">In Stock</p>
            <p className="text-xl font-black text-gray-900">{inStock}</p>
          </div>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="bg-orange-50 text-orange-400 p-3 rounded-xl"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Low Stock</p>
            <p className="text-xl font-black text-gray-900">{lowStock}</p>
          </div>
        </div>
        <div className="bg-white border border-red-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
          <div className="bg-red-50 text-red-500 p-3 rounded-xl"><Ban size={24} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Out of Stock</p>
            <p className="text-xl font-black text-gray-900">{outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Main Inventory List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 relative bg-gray-50/50">
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-baltic-blue outline-none transition-all" 
          />
          <Search size={18} className="absolute left-7 top-6 text-gray-400" />
        </div>

        {/* List Content */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading inventory...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              No products found. Click "Add Product" to get started.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition group">
                
                {/* Product Info */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center ${product.currentStock > 0 ? 'bg-blue-50 text-rich-cerulean' : 'bg-red-50 text-red-500'}`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500 font-medium">CP: ₹{product.costPrice.toFixed(2)}</p>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <p className="text-xs text-baltic-blue font-bold">SP: ₹{product.sellingPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions & Adjusters */}
                <div className="flex items-center justify-between md:justify-end gap-6">
                  
                  {/* Stock Adjuster */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <button onClick={() => quickStockAdjust(product.id, product.currentStock, -1)} className="text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition"><MinusCircle size={18}/></button>
                    <div className="flex flex-col items-center w-12">
                      <span className="text-sm font-black leading-none">{product.currentStock}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Stock</span>
                    </div>
                    <button onClick={() => quickStockAdjust(product.id, product.currentStock, 1)} className="text-sage-green hover:bg-green-50 rounded-lg p-1.5 transition"><PlusCircle size={18}/></button>
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(product)} className="p-2.5 text-gray-400 hover:text-baltic-blue hover:bg-blue-50 rounded-xl transition border border-transparent hover:border-blue-100" title="Edit Product">
                      <Edit size={18}/>
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100" title="Delete Product">
                      <Trash2 size={18}/>
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <p className="text-xs text-gray-500 mt-1">{editingProduct ? "Update catalog details" : "Add item to your shop catalog"}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Product Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Milk (1 Litre)"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-baltic-blue outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Cost Price (₹)</label>
                  <input 
                    type="number" 
                    required min="0" step="0.01"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-baltic-blue outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    required min="0" step="0.01"
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-baltic-blue outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Current Stock</label>
                <input 
                  type="number" 
                  required min="0"
                  placeholder="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-baltic-blue outline-none transition-all"
                />
              </div>

              {/* Real-time Margin Display */}
              {!isNaN(margin) && formData.sellingPrice !== "" && formData.costPrice !== "" && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between ${margin >= 0 ? 'bg-green-50 text-sage-green border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                  <span>{margin >= 0 ? 'Estimated Profit/Item' : 'Estimated Loss/Item'}</span>
                  <span className="text-lg">₹{Math.abs(margin).toFixed(2)}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-baltic-blue text-white font-black py-4 rounded-xl mt-4 shadow-md hover:bg-rich-cerulean transition active:scale-[0.98] disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}