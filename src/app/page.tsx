"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Store, PlayCircle, CheckCircle2, ShieldCheck, 
  Smartphone, Users, Package, ShoppingCart, TrendingUp, 
  FileText, MapPin, ChevronRight, Star, Plus, ArrowRight
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, limit, query } from "firebase/firestore";

export default function LandingPage() {
  const [publicShops, setPublicShops] = useState<any[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const q = query(collection(db, "shops"), limit(4));
        const snap = await getDocs(q);
        const shopsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPublicShops(shopsData);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      }
    };
    fetchShops();
  }, []);

  const displayShops = publicShops.length > 0 ? publicShops : [
    { id: '1', shopName: 'Sharma General Store', shopAddress: 'New Market, Delhi', category: 'Grocery', status: 'Open', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400', products: '320+' },
    { id: '2', shopName: 'Care Medical Store', shopAddress: 'Lajpat Nagar, Delhi', category: 'Medical', status: 'Open', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400', products: '450+' },
    { id: '3', shopName: 'Mobile Point', shopAddress: 'Karol Bagh, Delhi', category: 'Mobile', status: 'Open', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', products: '180+' },
    { id: '4', shopName: 'Sky Stationery', shopAddress: 'Tilak Nagar, Delhi', category: 'Stationery', status: 'Close 9 PM', image: 'https://images.unsplash.com/photo-1583485088034-697b5a541b10?w=400', products: '250+' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] font-sans flex flex-col text-slate-800 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* --- INJECTED CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-x 8s ease infinite; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); }
      `}} />

      {/* 1. ULTRA-MINIMAL STICKY NAVBAR */}
      <nav className="fixed w-full top-0 z-[100] transition-all duration-300 bg-white/60 backdrop-blur-xl border-b border-white/40">
        <div className="w-full px-4 sm:px-8 h-16 flex justify-between items-center max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-gradient-to-tr from-[#4F46E5] to-purple-500 p-1.5 rounded-lg text-white group-hover:rotate-12 transition-transform">
              <Store size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 tracking-tighter leading-none uppercase">QUREVO SHOP</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-[#4F46E5] transition-colors">Features</a>
            <a href="#shops" className="hover:text-[#4F46E5] transition-colors">Directory</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-xs font-bold text-slate-700 hover:text-[#4F46E5] px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Log in
            </Link>
            <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. DYNAMIC HERO WITH MOVING BACKGROUNDS */}
      <div className="relative w-full pt-28 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-10 w-[400px] h-[400px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob"></div>
        <div className="absolute top-10 right-20 w-[400px] h-[400px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-[400px] h-[400px] bg-sky-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-[#4F46E5] px-4 py-2 rounded-full text-xs font-bold mb-6 border border-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Trusted by 25,000+ Shops
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tighter">
              Apni Dukaan ko <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-purple-600 animate-gradient">
                Digital Banao.
              </span>
            </h1>
            <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Stock, Sales, Profit aur Customer Udhaar — sab kuch ek hi jagah. Manage your entire shop directly from your phone.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
              <Link href="/register" className="w-full sm:w-auto bg-[#4F46E5] text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Open My Shop <ChevronRight size={18} />
              </Link>
            
            </div>
          </div>

          {/* Floating Phone Mockup */}
          <div className="w-full flex justify-center lg:justify-end mt-10 lg:mt-0 perspective-1000">
             <div className="relative w-[300px] h-[620px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[4px] border-slate-800 animate-float transform rotate-y-[-10deg] rotate-x-[5deg]">
               <div className="w-full h-full bg-slate-50 rounded-[2.2rem] overflow-hidden flex flex-col relative shadow-inner">
                  
                  {/* Fake UI inside Phone */}
                  <div className="bg-gradient-to-b from-[#4F46E5] to-indigo-700 p-5 pb-10 text-white relative">
                    <div className="flex justify-between items-center mb-6">
                      <div><p className="text-[10px] opacity-80 font-medium">Namaste, Ravi 👋</p><p className="font-bold text-sm tracking-tight">Sharma General Store</p></div>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"><Store size={14}/></div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1 font-bold">Aaj ki Sales</p>
                    <div className="flex justify-between items-end">
                      <p className="text-4xl font-black tracking-tighter">₹ 12,450</p>
                    </div>
                  </div>
                  
                  {/* Overlapping Stats */}
                  <div className="flex gap-2 px-3 -mt-6 relative z-10">
                    <div className="flex-1 bg-white p-3 rounded-2xl shadow-lg border border-slate-100"><p className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Profit</p><p className="text-sm font-black text-emerald-500">₹3,245</p></div>
                    <div className="flex-1 bg-white p-3 rounded-2xl shadow-lg border border-slate-100"><p className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Udhaar</p><p className="text-sm font-black text-orange-500">₹4,800</p></div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="p-4 mt-2">
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[{i: ShoppingCart, c: "text-blue-600", bg: "bg-blue-50"}, {i: Package, c: "text-emerald-600", bg: "bg-emerald-50"}, {i: Users, c: "text-orange-600", bg: "bg-orange-50"}, {i: FileText, c: "text-purple-600", bg: "bg-purple-50"}].map((btn, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5"><div className={`w-12 h-12 ${btn.bg} ${btn.c} rounded-[1rem] flex items-center justify-center shadow-sm`}><btn.i size={18}/></div><div className="w-8 h-1 bg-slate-200 rounded-full mt-1"></div></div>
                      ))}
                    </div>
                    {/* Fake List */}
                    <div className="space-y-3">
                       {[1,2,3].map(i => <div key={i} className="w-full h-12 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center px-3 gap-3"><div className="w-8 h-8 rounded-full bg-slate-100"></div><div className="flex-1"><div className="w-16 h-2 bg-slate-200 rounded-full mb-1"></div><div className="w-10 h-2 bg-slate-100 rounded-full"></div></div><div className="w-12 h-3 bg-slate-200 rounded-full"></div></div>)}
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 3. FLUID FEATURES GRID */}
      <div id="features" className="w-full px-4 sm:px-8 py-10">
        <div className="max-w-[1400px] mx-auto glass-panel rounded-[2rem] p-6 sm:p-10 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent opacity-50"></div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-8">
            {[
              { icon: <Package/>, title: "Inventory", desc: "Stock ka hisaab", c: "text-blue-500 bg-blue-50/80" },
              { icon: <ShoppingCart/>, title: "Sales", desc: "Fast record", c: "text-indigo-500 bg-indigo-50/80" },
              { icon: <Users/>, title: "Udhaar", desc: "Payment track", c: "text-orange-500 bg-orange-50/80" },
              { icon: <TrendingUp/>, title: "Profit", desc: "Munafa jankari", c: "text-emerald-500 bg-emerald-50/80" },
              { icon: <FileText/>, title: "Reports", desc: "Daily analysis", c: "text-purple-500 bg-purple-50/80" },
              { icon: <ShieldCheck/>, title: "Invoices", desc: "Professional bills", c: "text-sky-500 bg-sky-50/80" }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white/50 transition-colors cursor-default">
                <div className={`w-14 h-14 rounded-2xl ${feature.c} flex items-center justify-center mb-3 shadow-sm`}>{feature.icon}</div>
                <h3 className="text-sm font-black text-slate-900 mb-0.5 tracking-tight">{feature.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. EDGE-TO-EDGE LOCAL SHOPS */}
      <div id="shops" className="w-full py-20 px-2 sm:px-8 relative">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 px-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-2">Local Shops</h2>
              <p className="text-sm text-slate-500 font-medium">Dekho wo shops jo Qurevo Shop use kar rahe hain</p>
            </div>
            <Link href="/shop" className="mt-4 sm:mt-0 text-sm font-bold text-[#4F46E5] flex items-center gap-1 hover:gap-2 transition-all">
              View Directory <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayShops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-[1.5rem] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group border border-slate-100">
                <div className="w-full h-48 bg-slate-100 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                  <img src={shop.shopLogoUrl || shop.image} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                  <span className={`absolute top-4 right-4 z-20 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md ${shop.status === 'Close 9 PM' ? 'bg-orange-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                    {shop.status || "Open"}
                  </span>
                </div>
                <div className="p-5 sm:p-6 relative z-20 bg-white">
                  <h3 className="text-lg font-black text-slate-900 truncate mb-1">{shop.shopName}</h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-4 uppercase tracking-widest">
                    <MapPin size={12}/> {shop.shopAddress || "Local Area"}
                  </p>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">{shop.products || "Multiple Products"} </span>
                    <Link href={`/shop/${shop.id}`} className="w-8 h-8 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                      <ChevronRight size={16}/>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. IMMERSIVE CTA BANNER */}
      <div className="w-full px-4 sm:px-8 pb-10">
        <div className="max-w-[1400px] mx-auto bg-slate-900 rounded-[2.5rem] p-8 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          {/* Animated Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-indigo-600/40 animate-gradient opacity-50"></div>
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="z-10 flex-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tighter">Apni Dukaan Ko <br className="hidden sm:block"/> Digital Banao Aaj Hi</h2>
            <p className="text-indigo-200 font-medium text-base sm:text-lg">Join 25,000+ shopkeepers and grow your business with Qurevo.</p>
          </div>

          <div className="z-10 shrink-0 w-full md:w-auto flex flex-col items-center">
            <Link href="/register" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 text-lg">
              Open My Shop <ArrowRight size={20}/>
            </Link>
            <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Start Free • No Card Required</p>
          </div>
        </div>
      </div>

      {/* 6. COMPACT FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-[#4F46E5]" />
            <span className="text-sm font-black text-[#1E293B] tracking-tighter uppercase">QUREVO SHOP - Powered by Qurevo Technologies</span>
          </div>
          
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">

            
            © 2026 Qurevo Technologies. All rights reserved.
          {/* UPDATED PRIVACY AND TERMS LINKS */}
            <Link href="/privacy" className="hover:text-[#4F46E5] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#4F46E5] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}