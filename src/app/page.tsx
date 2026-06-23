"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, limit, query } from "firebase/firestore";

export default function LandingPage() {
  const [publicShops, setPublicShops] = useState<any[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);

  // Fetch real shops from Firebase
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const q = query(collection(db, "shops"), limit(4));
        const snap = await getDocs(q);
        const shopsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPublicShops(shopsData);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      
      {/* MINIMAL NAVBAR */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Store size={24} className="text-indigo-600" />
            <span className="text-xl font-black tracking-tight uppercase">Qurevo POS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition">
              Log in
            </Link>
            <Link href="/register" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* CLEAN HERO SECTION */}
      <main className="w-full bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
              Run your entire store <span className="text-indigo-600">online.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 font-medium mb-8 max-w-lg mx-auto lg:mx-0">
              A lightning-fast POS, inventory manager, and customer ledger built specifically for modern shop owners.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
              <Link href="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-bold hover:bg-indigo-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-sm">
                Open Your Store <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500"/> Easy Billing</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500"/> Stock Tracking</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500"/> Ledger Sync</span>
            </div>
          </div>

          {/* Minimal Hero Image/Graphic */}
          <div className="w-full h-64 sm:h-80 lg:h-96 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvY2VyeSUyMHN0b3JlfGVufDB8fDB8fHww" 
              alt="Shop Owner" 
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </main>

      {/* REAL FIREBASE SHOPS SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20 w-full flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Store size={24} className="text-indigo-600" /> Local Shops
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Discover stores powered by Qurevo.</p>
          </div>
        </div>

        {loadingShops ? (
          <div className="text-center py-12 text-sm font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 rounded-2xl animate-pulse">
            Loading stores...
          </div>
        ) : publicShops.length === 0 ? (
          <div className="text-center py-12 text-sm font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 rounded-2xl">
            No public stores available yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {publicShops.map((shop) => (
              <Link href={`/shop/${shop.id}`} key={shop.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col hover:border-indigo-300 hover:shadow-md transition group">
                <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                  {shop.shopLogoUrl ? (
                    <img src={shop.shopLogoUrl} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Store size={32}/></div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 truncate">{shop.shopName}</h3>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1 truncate">
                  <MapPin size={12} className="shrink-0"/> {shop.shopAddress || "Location not provided"}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md uppercase tracking-wider">
                    Open
                  </span>
                  <span className="text-xs font-bold text-indigo-600">View Store &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center">
        <p className="text-xs font-bold text-slate-400">Powered by Qurevo Technologies</p>
      </footer>
    </div>
  );
}