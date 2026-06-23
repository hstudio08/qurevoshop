"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAllPlatformShops, toggleShopStatusDB, hideShopFromDB, restoreShopFromDB } from "@/lib/firebase/adminService";
import { 
  Store, ShieldAlert, Activity, Ban, CheckCircle, Eye, EyeOff, 
  X, MapPin, Mail, Phone, Calendar, RefreshCw, User, Fingerprint 
} from "lucide-react";
import { Shop } from "@/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Extend Shop type locally for Admin purposes
interface AdminShop extends Shop {
  isHidden?: boolean;
}

export default function SuperAdminPage() {
  const { shop } = useAuthStore();
  const router = useRouter();
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedShop, setSelectedShop] = useState<AdminShop | null>(null);

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
      // Sort so active shops are top, then suspended, then hidden
      data.sort((a: any, b: any) => {
        if (a.isHidden !== b.isHidden) return a.isHidden ? 1 : -1;
        return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
      });
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

  const handleRestoreShop = async (shopId: string) => {
    if (!confirm("Are you sure you want to restore and reactivate this hidden shop?")) return;
    try {
      await restoreShopFromDB(shopId);
      toast.success("Shop restored successfully");
      setSelectedShop(null);
      loadShops();
    } catch (e) {
      toast.error("Restore failed");
    }
  };

  // Hardware Passkey Registration for Super Admin
  const handleRegisterPasskey = async () => {
    try {
      if (!window.PublicKeyCredential) {
        return toast.error("WebAuthn is not supported on this browser/device.");
      }

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from("QurevoSecureChallenge123", c => c.charCodeAt(0)),
        rp: { name: "Qurevo Super Admin", id: window.location.hostname },
        user: { 
          id: Uint8Array.from(shop!.id, c => c.charCodeAt(0)), 
          name: shop!.email, 
          displayName: "Super Admin" 
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions }) as PublicKeyCredential;
      
      const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      localStorage.setItem("admin_passkey_id", rawId);
      localStorage.setItem("admin_passkey_email", shop!.email);
      
      toast.success("Device linked successfully! You can now use Fingerprint/FaceID to login.", { icon: "🔐" });
    } catch (error) {
      toast.error("Passkey registration failed or cancelled.");
    }
  };

  if (shop?.role !== "Admin") return null;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-4 mb-6">
        <div className="bg-baltic-blue p-3 rounded-2xl shadow-md">
          <ShieldAlert size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-bebas tracking-wide">QUREVO SUPER ADMIN</h1>
          <p className="text-sm text-gray-500">Global SaaS Tenant Management & Monitoring</p>
        </div>
      </header>

      {/* Passkey Setup Card */}
      <div className="bg-gradient-to-r from-baltic-blue to-rich-cerulean rounded-2xl p-6 shadow-md text-white mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black font-bebas tracking-wide flex items-center gap-2">
            <Fingerprint size={20} /> Device-Bound Passkey Security
          </h3>
          <p className="text-xs text-blue-100 mt-1 max-w-md">
            Link this specific device's hardware scanner (FaceID/Fingerprint) to bypass the password screen on the login page.
          </p>
        </div>
        <button 
          onClick={handleRegisterPasskey}
          className="bg-white text-baltic-blue px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition whitespace-nowrap"
        >
          Link Device Passkey
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2 sm:p-3 bg-blue-50 text-baltic-blue rounded-xl"><Store size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Tenants</p>
            <p className="text-2xl font-black font-ibm">{shops.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2 sm:p-3 bg-green-50 text-sage-green rounded-xl"><Activity size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
            <p className="text-2xl font-black font-ibm text-sage-green">{shops.filter(s => s.isActive && !s.isHidden).length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2 sm:p-3 bg-orange-50 text-orange-500 rounded-xl"><Ban size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suspended</p>
            <p className="text-2xl font-black font-ibm text-orange-500">{shops.filter(s => !s.isActive && !s.isHidden).length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2 sm:p-3 bg-red-50 text-red-500 rounded-xl"><EyeOff size={20}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soft Deleted</p>
            <p className="text-2xl font-black font-ibm text-red-500">{shops.filter(s => s.isHidden).length}</p>
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
              <div key={s.id} className={`p-4 sm:p-5 flex flex-col md:flex-row justify-between items-center transition gap-4 ${s.isHidden ? 'bg-red-50/30 opacity-75 grayscale-[0.5]' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`w-3 h-3 rounded-full shadow-inner shrink-0 ${s.isHidden ? 'bg-gray-400' : s.isActive ? 'bg-sage-green' : 'bg-red-500'}`}></div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-base ${s.isHidden ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{s.shopName}</h4>
                      {s.isHidden && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase">Hidden</span>}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate">{s.ownerName} • {s.businessCategory}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                  <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold tracking-widest uppercase ${s.isHidden ? 'bg-gray-100 text-gray-500' : s.isActive ? 'bg-green-50 text-sage-green' : 'bg-orange-50 text-orange-600'}`}>
                    {s.isHidden ? 'Deleted' : s.isActive ? 'Active' : 'Suspended'}
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            
            <div className={`p-6 flex justify-between items-start text-white ${selectedShop.isHidden ? 'bg-red-900' : 'bg-baltic-blue'}`}>
              <div>
                <h2 className="text-3xl font-black font-bebas tracking-wide flex items-center gap-3">
                  {selectedShop.shopName}
                  {selectedShop.isHidden && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-sans font-bold tracking-widest uppercase">Soft Deleted</span>}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedShop.isHidden ? 'bg-gray-400' : selectedShop.isActive ? 'bg-green-400' : 'bg-orange-500'}`}></span>
                  <p className="text-xs font-bold opacity-90">{selectedShop.isHidden ? 'Hidden from Platform' : selectedShop.isActive ? 'Currently Active' : 'Account Suspended'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedShop(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"><X size={20}/></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</p>
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Business Category</p>
                    <p className="text-sm font-bold text-gray-900">{selectedShop.businessCategory}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><MapPin size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Physical Address</p>
                    <p className="text-sm font-bold text-gray-900">{selectedShop.shopAddress}, {selectedShop.state}, {selectedShop.country} - {selectedShop.pincode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><Calendar size={18}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registration Date</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{new Date(selectedShop.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end items-center">
              
              {selectedShop.isHidden ? (
                <button 
                  onClick={() => handleRestoreShop(selectedShop.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-baltic-blue text-white hover:bg-rich-cerulean transition shadow-md"
                >
                  <RefreshCw size={16}/> Restore & Reactivate Account
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleHideShop(selectedShop.id)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-sm"
                  >
                    <EyeOff size={16}/> Soft Delete (Hide)
                  </button>
                  
                  <button 
                    onClick={() => handleToggleStatus(selectedShop.id, selectedShop.isActive)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${selectedShop.isActive ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-sage-green text-white hover:bg-green-600'}`}
                  >
                    {selectedShop.isActive ? <><Ban size={16}/> Suspend Activity</> : <><CheckCircle size={16}/> Reactivate Activity</>}
                  </button>
                </>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}