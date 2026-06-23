"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Store, MapPin, Package, AlertCircle, Search, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function PublicShopPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        if (!id) return;
        
        // 1. Fetch Shop Details
        const shopRef = doc(db, "shops", id as string);
        const shopDoc = await getDoc(shopRef);
        
        if (!shopDoc.exists()) {
          setError(true);
          setLoading(false);
          return;
        }
        setShop(shopDoc.data());

        // 2. Fortified Product Fetching
        const topLevelQuery = query(collection(db, "products"), where("shopId", "==", id));
        const subCollectionRef = collection(db, `shops/${id}/products`);

        const [topLevelSnap, subSnap] = await Promise.all([
          getDocs(topLevelQuery).catch(() => ({ docs: [] })),
          getDocs(subCollectionRef).catch(() => ({ docs: [] }))
        ]);

        const topProducts = topLevelSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const subProducts = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setProducts(topProducts.length > 0 ? topProducts : subProducts);
      } catch (err) {
        console.error("Error fetching shop data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [id]);

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0066FF] rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Storefront...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
      <AlertCircle size={64} className="text-slate-300 mb-4" />
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Not Found</h1>
      <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">This store link is invalid or the owner has removed their catalog.</p>
      <Link href="/" className="mt-6 bg-[#0066FF] text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
        <ArrowLeft size={18}/> Return Home
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 flex flex-col">
      
      {/* 1. CLEAN MODERN HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-bold hidden sm:block">Back to Directory</span>
          </Link>
          <div className="flex items-center gap-1.5 opacity-60">
            <Store size={14} className="text-[#0066FF]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Powered by Qurevo</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Logo - Adjusted to object-contain so rectangular banners don't get cropped */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
            <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 p-2">
              {shop?.shopLogoUrl ? (
                <img src={shop.shopLogoUrl} className="w-full h-full object-contain" alt={shop?.shopName} />
              ) : (
                <Store size={48} className="text-slate-200" />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 mt-2 sm:mt-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
              {shop?.shopName || "Unnamed Store"}
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
              Operated by {shop?.ownerName || "Shop Owner"}
            </p>
            {shop?.shopAddress && (
              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50">
                <MapPin size={16} className="text-[#0066FF]"/> {shop.shopAddress}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. STICKY SEARCH BAR */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 sm:py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="relative w-full flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-[#0066FF] px-5 py-3 rounded-xl font-bold text-sm shrink-0 border border-blue-100">
            <Package size={18}/> {products.length} Products
          </div>
        </div>
      </div>

      {/* 3. PRODUCT CATALOG - MASONRY LAYOUT */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 flex-1">
        
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-16 text-center flex flex-col items-center justify-center border border-slate-200 shadow-sm max-w-2xl mx-auto mt-8">
            <ShoppingBag size={56} className="text-slate-200 mb-5" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Catalog is Empty</h3>
            <p className="text-sm font-medium text-slate-500">This store has not added any products to their public catalog yet. Check back later!</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No matching products.</p>
          </div>
        ) : (
          /* CSS MASONRY GRID (columns-X handles the masonry flow, break-inside-avoid prevents cards splitting) */
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-5 space-y-3 sm:space-y-5">
            {filteredProducts.map((product) => (
              <div key={product.id} className="break-inside-avoid bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                
                {/* Flexible Masonry Image Area */}
                <div className="w-full bg-slate-50 relative overflow-hidden border-b border-slate-100 flex items-center justify-center p-3 sm:p-4">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      // h-auto and max-h-[260px] guarantees the full image is shown without taking up the entire screen height
                      className="w-full h-auto max-h-[220px] sm:max-h-[260px] object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-500" 
                    />
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center w-full h-full">
                      <Package size={32} className="text-slate-200"/>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-3 sm:p-4 flex flex-col bg-white">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mb-3 group-hover:text-[#0066FF] transition-colors break-words">
                    {product.name}
                  </h3>
                  
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-end mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
                      <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-none">₹{product.sellingPrice}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-[#0066FF] transition-colors shrink-0">
                      <ArrowRight size={12} strokeWidth={3} />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}