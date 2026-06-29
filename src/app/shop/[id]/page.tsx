"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Store, MapPin, Package, AlertCircle, Search, ShoppingBag, ArrowLeft } from "lucide-react";
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
        
        const shopRef = doc(db, "shops", id as string);
        const shopDoc = await getDoc(shopRef);
        
        if (!shopDoc.exists()) {
          setError(true);
          setLoading(false);
          return;
        }
        setShop(shopDoc.data());

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

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Storefront...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <AlertCircle size={40} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Store Not Found</h1>
      <p className="text-base font-medium text-slate-500 mt-3 max-w-sm">This store link is invalid or the owner has removed their catalog.</p>
      <Link href="/" className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2">
        <ArrowLeft size={18}/> Return Directory
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. TOP NAV */}
      <nav className="absolute top-0 w-full z-50 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Directory</span>
          </Link>
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Store size={14} className="text-white" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Qurevo</span>
          </div>
        </div>
      </nav>

      {/* 2. COVER BANNER & PROFILE OVERLAY */}
      <header className="bg-white border-b border-slate-200/60 pb-8 sm:pb-12 shadow-sm">
        {/* Cover Photo */}
        <div className="w-full h-48 sm:h-64 md:h-80 bg-slate-200 relative overflow-hidden">
          {shop?.coverPhotoUrl ? (
            <img src={shop.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>
          )}
        </div>

        {/* Profile Info (Overlapping) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6 -mt-16 sm:-mt-20">
            
            {/* Square Logo with thick border */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl p-1.5 shadow-xl shadow-slate-900/10 shrink-0 z-10">
              <div className="w-full h-full rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {shop?.shopLogoUrl ? (
                  <img src={shop.shopLogoUrl} className="w-full h-full object-cover" alt={shop?.shopName} />
                ) : (
                  <Store size={48} className="text-slate-300" />
                )}
              </div>
            </div>

            {/* Shop Text Info */}
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 sm:mb-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {shop?.shopName || "Unnamed Store"}
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1 mb-3">
                Operated by {shop?.ownerName || "Shop Owner"}
              </p>
              {shop?.shopAddress && (
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
                  <MapPin size={16} className="text-indigo-600"/> {shop.shopAddress}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. STICKY GLASSMORPHISM SEARCH */}
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/60 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full flex-1 max-w-2xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products in this store..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:border-slate-300"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white text-indigo-700 px-5 py-3.5 rounded-2xl font-bold text-sm shrink-0 border border-slate-200 shadow-sm">
            <Package size={18} className="text-indigo-500"/> {products.length} Products
          </div>
        </div>
      </div>

      {/* 4. PREMIUM PRODUCT CATALOG */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        
        {products.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 sm:p-20 text-center flex flex-col items-center justify-center border border-slate-200/60 shadow-sm max-w-2xl mx-auto mt-10">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Catalog is Empty</h3>
            <p className="text-base font-medium text-slate-500 max-w-md">This store has not added any products to their public catalog yet. Check back later!</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <Search size={48} className="mx-auto text-slate-300 mb-5" />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No matching products found.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="break-inside-avoid bg-white rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col group hover:border-indigo-200 hover:shadow-[0_8px_30px_rgb(79,70,229,0.08)] transition-all duration-300 cursor-pointer">
                
                <div className="w-full bg-slate-50 relative overflow-hidden border-b border-slate-100 flex items-center justify-center p-4">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-auto max-h-[220px] sm:max-h-[260px] object-contain mix-blend-multiply group-hover:scale-[1.05] transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center w-full h-full">
                      <Package size={40} className="text-slate-200"/>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex flex-col bg-white">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug mb-4 group-hover:text-indigo-600 transition-colors break-words">
                    {product.name}
                  </h3>
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price</span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">₹{product.sellingPrice}</span>
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