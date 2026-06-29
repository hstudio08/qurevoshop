"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Store, MapPin, Package, AlertCircle, Search, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react";
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
      <nav className="absolute top-0 w-full z-50 bg-gradient-to-b from-black/60 to-transparent pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-black/40">
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
        {/* Cover Photo - Adjusted to respect 16:9 crop optimally while capping height on massive screens */}
        <div className="w-full aspect-[16/9] max-h-[350px] sm:max-h-[400px] md:max-h-[450px] bg-slate-200 relative overflow-hidden">
          {shop?.coverPhotoUrl ? (
            <img src={shop.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-indigo-900 via-indigo-600 to-purple-500"></div>
          )}
          {/* Subtle gradient overlay to blend the bottom edge slightly */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Profile Info (Stacked Layout) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Changed sm:flex-row to flex-col to force stacking below the image */}
          <div className="flex flex-col items-center sm:items-start gap-4 sm:gap-5 -mt-16 sm:-mt-20">
            
            {/* Square Logo 1:1 strict aspect ratio */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 aspect-square bg-white rounded-3xl p-1.5 shadow-2xl shadow-black/10 shrink-0 z-10 relative group">
              <div className="w-full h-full rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {shop?.shopLogoUrl ? (
                  <img src={shop.shopLogoUrl} className="w-full h-full object-cover" alt={shop?.shopName} />
                ) : (
                  <Store size={48} className="text-slate-300" />
                )}
              </div>
            </div>

            {/* Shop Text Info (Now sits below the logo) */}
            <div className="w-full text-center sm:text-left pt-2 pb-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {shop?.shopName || "Unnamed Store"}
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 mb-4">
                Operated by {shop?.ownerName || "Shop Owner"}
              </p>
              {shop?.shopAddress && (
                <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/60">
                  <MapPin size={16} className="text-indigo-600"/> {shop.shopAddress}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </header>

      {/* 3. STICKY GLASSMORPHISM SEARCH */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full flex-1 max-w-2xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products in this store..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:border-slate-300"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-3.5 rounded-2xl font-bold text-sm shrink-0 border border-indigo-100/50">
            <Package size={18} className="text-indigo-500"/> {products.length} Products
          </div>
        </div>
      </div>

      {/* 4. PREMIUM PRODUCT CATALOG (CSS GRID) */}
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
          /* Switched to a robust CSS Grid for professional e-commerce layout */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 overflow-hidden flex flex-col group transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                
                {/* Product Image Area - Locked aspect ratio for perfect alignment */}
                <div className="w-full aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-100">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out" 
                    />
                  ) : (
                    <Package size={40} className="text-slate-200 group-hover:scale-110 transition-transform duration-500"/>
                  )}
                  
                  {/* Subtle View Overlay */}
                  <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors duration-300"></div>
                </div>

                {/* Product Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white relative">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
                      <span className="block text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                        ₹{product.sellingPrice}
                      </span>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-600">
                      <ChevronRight size={18} />
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