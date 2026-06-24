"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Store, ShoppingCart, Users, Package, TrendingUp, 
  FileText, MapPin, ChevronRight, ArrowRight, ShieldCheck, 
  Globe, Server, Zap, CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, limit, query } from "firebase/firestore";

export default function LandingPage() {
  const [publicShops, setPublicShops] = useState<any[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const q = query(collection(db, "shops"), limit(10));
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
    { id: '1', shopName: 'Sharma General Store', shopAddress: 'New Market, Delhi', category: 'Grocery', status: 'Open', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=400&fit=crop', products: '320+' }, 
    { id: '2', shopName: 'Care Medical Store', shopAddress: 'Lajpat Nagar, Delhi', category: 'Medical', status: 'Open', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=800&fit=crop', products: '450+' }, 
    { id: '3', shopName: 'Mobile Point', shopAddress: 'Karol Bagh, Delhi', category: 'Mobile', status: 'Open', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop', products: '180+' }, 
    { id: '4', shopName: 'Sky Stationery', shopAddress: 'Tilak Nagar, Delhi', category: 'Stationery', status: 'Close 9 PM', image: 'https://images.unsplash.com/photo-1583485088034-697b5a541b10?w=600&h=900&fit=crop', products: '250+' }, 
    { id: '5', shopName: 'Fresh Bakers', shopAddress: 'Connaught Place, Delhi', category: 'Bakery', status: 'Open', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=450&fit=crop', products: '120+' }, 
    { id: '6', shopName: 'City Electronics', shopAddress: 'Nehru Place, Delhi', category: 'Electronics', status: 'Open', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=750&fit=crop', products: '90+' }, 
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col text-slate-900 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
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
        .animate-blob { animation: blob 8s infinite ease-in-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-x 8s ease infinite; }
      `}} />

      {/* 1. NAVBAR */}
      <nav className="fixed w-full top-0 z-[100] transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="w-full px-4 sm:px-8 h-16 flex justify-between items-center max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:rotate-12 transition-transform shadow-md shadow-indigo-600/20">
              <Store size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-black text-slate-900 tracking-tight uppercase">Qurevo Shop</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">Platform</a>
            <a href="#shops" className="hover:text-indigo-600 transition-colors">Directory</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-xs font-bold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Log in
            </Link>
            <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative w-full pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-10 right-20 w-[400px] h-[400px] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-full text-xs font-bold mb-8 shadow-sm border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Trusted by 25,000+ Shops
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] mb-6 tracking-tighter">
              Apni Dukaan ko <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-gradient">
                Digital Banao.
              </span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
              Stock, Sales, Profit aur Customer Udhaar — sab kuch ek hi jagah. Manage your entire retail business professionally, directly from your device.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Open My Shop <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="w-full flex justify-center lg:justify-end mt-10 lg:mt-0 perspective-1000">
             <div className="relative w-[320px] h-[650px] bg-slate-900 rounded-[3rem] p-3.5 shadow-2xl border-[4px] border-slate-800 animate-float transform rotate-y-[-12deg] rotate-x-[8deg]">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-50"></div>
               <div className="w-full h-full bg-slate-50 rounded-[2.2rem] overflow-hidden flex flex-col relative shadow-inner">
                 <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 p-6 pb-12 text-white relative">
                   <div className="flex justify-between items-center mb-8 mt-2">
                     <div>
                       <p className="text-[10px] opacity-80 font-medium uppercase tracking-widest mb-1">Namaste, Ravi 👋</p>
                       <p className="font-bold text-sm tracking-tight">Sharma General Store</p>
                     </div>
                     <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center"><Store size={16}/></div>
                   </div>
                   <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1 font-bold">Today's Revenue</p>
                   <div className="flex justify-between items-end">
                     <p className="text-4xl font-black tracking-tighter">₹ 12,450</p>
                   </div>
                 </div>
                 
                 <div className="flex gap-3 px-4 -mt-6 relative z-10">
                   <div className="flex-1 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-100/50">
                     <p className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-widest">Net Profit</p>
                     <p className="text-base font-black text-emerald-500">₹3,245</p>
                   </div>
                   <div className="flex-1 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-100/50">
                     <p className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-widest">Active Credit</p>
                     <p className="text-base font-black text-orange-500">₹4,800</p>
                   </div>
                 </div>
                 
                 <div className="p-5 mt-2 flex-1 flex flex-col">
                   <div className="grid grid-cols-4 gap-3 mb-6">
                     {[{i: ShoppingCart, c: "text-blue-600", bg: "bg-blue-50"}, {i: Package, c: "text-emerald-600", bg: "bg-emerald-50"}, {i: Users, c: "text-orange-600", bg: "bg-orange-50"}, {i: FileText, c: "text-purple-600", bg: "bg-purple-50"}].map((btn, idx) => (
                       <div key={idx} className="flex flex-col items-center gap-2">
                         <div className={`w-14 h-14 ${btn.bg} ${btn.c} rounded-2xl flex items-center justify-center shadow-sm`}><btn.i size={20} strokeWidth={2.5}/></div>
                         <div className="w-8 h-1 bg-slate-200 rounded-full mt-1"></div>
                       </div>
                     ))}
                   </div>
                   <div className="space-y-3 flex-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center p-3.5 gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0"></div>
                          <div className="flex-1">
                            <div className="w-20 h-2.5 bg-slate-200 rounded-full mb-2"></div>
                            <div className="w-12 h-2 bg-slate-100 rounded-full"></div>
                          </div>
                          <div className="w-14 h-3.5 bg-slate-200 rounded-full shrink-0"></div>
                        </div>
                      ))}
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 3. FLUID FEATURES GRID */}
      <div id="features" className="w-full px-4 sm:px-8 py-16 bg-white">
        <div className="max-w-[1400px] mx-auto text-center mb-12">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Enterprise POS in your Pocket</h2>
           <p className="text-slate-500 font-medium max-w-2xl mx-auto text-sm">Say goodbye to paper ledgers. Qurevo provides everything you need to run your retail business efficiently.</p>
        </div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {[
            { icon: <Package/>, title: "Inventory", desc: "Live Stock Tracking", c: "text-blue-600 bg-blue-50" },
            { icon: <ShoppingCart/>, title: "Point of Sale", desc: "Lightning Fast Billing", c: "text-indigo-600 bg-indigo-50" },
            { icon: <Users/>, title: "Digital Udhaar", desc: "Zero Lost Payments", c: "text-orange-600 bg-orange-50" },
            { icon: <TrendingUp/>, title: "Analytics", desc: "Real-time Profit", c: "text-emerald-600 bg-emerald-50" },
            { icon: <FileText/>, title: "Reports", desc: "Automated EOD", c: "text-purple-600 bg-purple-50" },
            { icon: <ShieldCheck/>, title: "Invoices", desc: "A4 Secure Receipts", c: "text-sky-600 bg-sky-50" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-default group">
              <div className={`w-16 h-16 rounded-2xl ${feature.c} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>{feature.icon}</div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">{feature.title}</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SEO SECTION 1: WHAT IS QUREVO SHOPS */}
      <section id="about" className="w-full py-20 px-4 sm:px-8 bg-slate-50 border-t border-slate-200/50">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
              <Globe size={14} /> Transforming India's Retail
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              What is <span className="text-indigo-600">Qurevo Shops?</span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-medium">
              Qurevo Shops is an advanced Mobile Point-of-Sale (mPOS) and Retail Management platform designed specifically to empower local retailers, supermarkets, and specialty stores. We replace traditional paper "khata" (ledgers) and complex desktop billing systems with a lightning-fast, cloud-based mobile solution.
            </p>
            <ul className="space-y-4">
              {[
                "Complete Digital Ledger (Khata) & Customer Credit Tracking",
                "Instant GST-Ready A4 Invoices with Cryptographic Integrity",
                "Real-time Inventory & Low-Stock Alerts",
                "Automated End-of-Day (EOD) Profit & Sales Reports"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 bg-emerald-100 text-emerald-600 rounded-full p-1"><CheckCircle2 size={14} strokeWidth={3}/></div>
                  <span className="text-sm font-bold text-slate-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-none relative">
            <div className="absolute inset-0 bg-indigo-600 translate-x-3 translate-y-3 rounded-3xl opacity-20"></div>
            <img 
              src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&h=600&fit=crop" 
              alt="Shopkeeper using Qurevo Shops POS" 
              className="relative z-10 w-full h-auto rounded-3xl shadow-xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. SEO SECTION 2: POWERED BY QUREVO TECHNOLOGIES */}
      <section className="w-full py-20 px-4 sm:px-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.3),transparent_50%)] pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {[
              { icon: Server, title: "Cloud Sync", desc: "Your data is instantly backed up to secure enterprise cloud servers." },
              { icon: ShieldCheck, title: "Secure Environment", desc: "End-to-end encryption ensures your profit and customer data is strictly private." },
              { icon: Zap, title: "Ease", desc: "Process bills flawlessly." },
              { icon: TrendingUp, title: "Scalable Ecosystem", desc: "Designed by Qurevo Technologies to grow as you open more branches." }
            ].map((box, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-md">
                <box.icon className="text-indigo-400 mb-4" size={24} />
                <h3 className="text-base font-bold text-white mb-2">{box.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{box.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Powered by <br /><span className="text-indigo-400">Qurevo Technologies</span>
            </h2>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Behind the sleek interface of Qurevo Shops lies the robust engineering of Qurevo Technologies. We are committed to building reliable, high-performance SaaS ecosystems that digitize the unorganized sector.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              From our unbreakable Firestore database infrastructure to our innovative cryptographic invoice hashing, Qurevo Technologies ensures your store runs 24/7 without a single hiccup.
            </p>
          </div>
        </div>
      </section>

      {/* 6. MASONRY LAYOUT: LOCAL SHOPS DIRECTORY */}
      <div id="shops" className="w-full py-24 px-4 sm:px-8 relative bg-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-2">Powered by Qurevo</h2>
              <p className="text-sm text-slate-500 font-medium">Discover modern retail stores upgrading their business in your area.</p>
            </div>
          </div>

          {/* 🔥 TRUE CSS MASONRY LAYOUT FIX 🔥 */}
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-5 space-y-3 sm:space-y-5">
            {displayShops.map((shop) => (
              <div 
                key={shop.id} 
                className="break-inside-avoid w-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group border border-slate-200/60"
              >
                <div className="w-full relative bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Flexible Height Image for perfect Masonry ratios */}
                  <img 
                    src={shop.shopLogoUrl || shop.image} 
                    alt={shop.shopName} 
                    className="w-full h-auto block object-cover group-hover:scale-105 transition duration-700"
                    loading="lazy"
                  />
                  
                  <span className={`absolute top-2 sm:top-4 right-2 sm:right-4 z-20 text-[8px] sm:text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm ${shop.status === 'Close 9 PM' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {shop.status || "Open"}
                  </span>
                </div>
                
                <div className="p-4 sm:p-5 relative z-20 bg-white">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-1">{shop.shopName}</h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 flex items-start gap-1.5 mb-4">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5"/> 
                    <span className="line-clamp-2">{shop.shopAddress || "Local Area"}</span>
                  </p>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md uppercase tracking-wider truncate max-w-[100px]">
                      {shop.products || "Retail"} 
                    </span>
                    <Link href={`/shop/${shop.id}`} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                      <ChevronRight size={14} strokeWidth={3}/>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. IMMERSIVE CTA BANNER */}
      <div className="w-full px-4 sm:px-8 pb-16 bg-slate-50">
        <div className="max-w-[1400px] mx-auto bg-slate-900 rounded-[3rem] p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-indigo-600/30 animate-gradient opacity-60"></div>
          <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="z-10 flex-1 text-center md:text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">Take your business<br />to the next level.</h2>
            <p className="text-indigo-200 font-medium text-base sm:text-lg max-w-lg mx-auto md:mx-0">Join the thousands of smart retailers who trust Qurevo to manage their daily operations.</p>
          </div>

          <div className="z-10 shrink-0 w-full md:w-auto flex flex-col items-center">
            <Link href="/register" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 text-lg">
              Start for Free <ArrowRight size={20}/>
            </Link>
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">No Credit Card Required</p>
          </div>
        </div>
      </div>

      {/* 8. COMPACT FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Store size={18} className="text-indigo-600" strokeWidth={2.5}/>
            <span className="text-xs font-black text-slate-900 tracking-tight uppercase">Qurevo Shops</span>
          </div>
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span>© 2026 Qurevo Technologies. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}