"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllPlatformShops, toggleShopStatusDB, hideShopFromDB } from "@/lib/firebase/adminService";
import { Store, ShieldAlert, Activity, Ban, CheckCircle, Eye, EyeOff, X, MapPin, Mail, Phone, Calendar, User } from "lucide-react";
import { Shop } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SuperAdminPage() {
  const { shop } = useAuthStore();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (shop && shop.role !== "Admin") {
      router.push("/dashboard"); 
    } else if (shop?.role === "Admin") {
      loadShops();
    }
  }, [shop, router]);

  const loadShops = async () => {
    try {
      const data = await getAllPlatformShops();
      setShops(data);
    } catch (e) {
      toast.error("Failed to load platform data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (shopId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'Suspend' : 'Reactivate'} this shop?`)) return;
    try {
      await toggleShopStatusDB(shopId, currentStatus);
      toast.success(`Shop ${currentStatus ? 'suspended' : 'reactivated'}`);
      setSelectedShop(null);
      loadShops(); 
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handleHideShop = async (shopId: string) => {
    if (!confirm("Are you sure you want to completely hide this account? (Soft Delete)")) return;
    try {
      await hideShopFromDB(shopId);
      toast.success("Shop hidden from platform");
      setSelectedShop(null);
      loadShops();
    } catch (e) {
      toast.error("Action failed");
    }
  };

  if (shop?.role !== "Admin") return null;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <div className="bg-baltic-blue p-3 rounded-2xl shadow-md">
          <ShieldAlert size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-bebas tracking-wide">QUREVO SUPER ADMIN</h1>
          <p className="text-sm text-gray-500">Global SaaS Tenant Management & Monitoring</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-baltic-blue rounded-xl"><Store size={24}/></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Tenants</p>
            <p className="text-3xl font-black font-ibm">{shops.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-sage-green rounded-xl"><Activity size={24}/></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Shops</p>
            <p className="text-3xl font-black font-ibm text-sage-green">{shops.filter(s => s.isActive).length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Ban size={24}/></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Suspended</p>
            <p className="text-3xl font-black font-ibm text-red-500">{shops.filter(s => !s.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Registered SaaS Shops</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? <div className="p-10 text-center text-gray-500 font-bold">Loading Platform Data...</div> : 
            shops.map((s) => (
              <div key={s.id} className="p-5 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`w-3 h-3 rounded-full shadow-inner ${s.isActive ? 'bg-sage-green' : 'bg-red-500'}`}></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{s.shopName}</h4>
                    <p className="text-xs text-gray-500 font-medium">{s.ownerName} • {s.businessCategory}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold tracking-widest uppercase ${s.isActive ? 'bg-green-50 text-sage-green' : 'bg-red-50 text-red-600'}`}>
                    {s.isActive ? 'Active' : 'Suspended'}
                  </span>
                  <button 
                    onClick={() => setSelectedShop(s)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-baltic-blue hover:text-white transition shadow-sm"
                  >
                    <Eye size={16}/> Details
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Full Details Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            
            <div className="bg-baltic-blue p-6 flex justify-between items-start text-white">
              <div>
                <h2 className="text-3xl font-black font-bebas tracking-wide">{selectedShop.shopName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedShop.isActive ? 'bg-green-400' : 'bg-red-500'}`}></span>
                  <p className="text-xs font-bold opacity-90">{selectedShop.isActive ? 'Currently Active' : 'Account Suspended'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedShop(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20}/></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-baltic-blue rounded-lg"><User size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Owner Name</p>
                    <p className="text-sm font-bold text-gray-900">{selectedShop.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-baltic-blue rounded-lg"><Phone size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</p>
                    <p className="text-sm font-bold text-gray-900 font-ibm">{selectedShop.mobileNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-baltic-blue rounded-lg"><Mail size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-gray-900">{selectedShop.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><Store size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</p>
                    <p className="text-sm font-bold text-gray-900">{selectedShop.businessCategory}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><MapPin size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                    <p className="text-sm font-bold text-gray-900">{selectedShop.shopAddress}, {selectedShop.state}, {selectedShop.country} - {selectedShop.pincode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><Calendar size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registration Date</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(selectedShop.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button 
                onClick={() => handleHideShop(selectedShop.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-red-600 transition shadow-sm"
              >
                <EyeOff size={16}/> Hide / Soft Delete
              </button>
              
              <button 
                onClick={() => handleToggleStatus(selectedShop.id, selectedShop.isActive)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${selectedShop.isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-sage-green text-white hover:bg-green-600'}`}
              >
                {selectedShop.isActive ? <><Ban size={16}/> Suspend Account</> : <><CheckCircle size={16}/> Reactivate Account</>}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}