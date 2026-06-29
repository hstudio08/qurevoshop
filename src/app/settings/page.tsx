"use client";

import { useState, useRef } from "react";
import { Building, LogOut, Check, HelpCircle, Store, UploadCloud, Image as ImageIcon, AlertCircle, CheckCircle2, Monitor } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { db, auth } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { shop, user, setAuth, logout } = useAuthStore();
  
  // States for Image Uploads
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // State for Text Form
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: shop?.shopName || "",
    mobileNumber: shop?.mobileNumber || "",
    shopAddress: shop?.shopAddress || "",
    businessCategory: shop?.businessCategory || "",
  });

  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "58724c8509a2aa71b59f73716b84db65";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !shop?.id) return;

    // Optional size limit check (increased to 500KB for cover photos)
    const limit = type === 'cover' ? 500 * 1024 : 100 * 1024;
    if (file.size > limit) {
      toast.error(`Image is too large! Max ${type === 'cover' ? '500KB' : '100KB'}.`);
      e.target.value = "";
      return;
    }

    const setUploading = type === 'logo' ? setIsUploadingLogo : setIsUploadingCover;
    setUploading(true);
    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      const imgFormData = new FormData();
      imgFormData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: imgFormData,
      });
      const data = await res.json();

      if (data.success) {
        const imageUrl = data.data.display_url;
        const updateField = type === 'logo' ? { shopLogoUrl: imageUrl } : { coverPhotoUrl: imageUrl };
        
        await updateDoc(doc(db, "shops", shop.id), updateField);
        if (user) setAuth(user, { ...shop, ...updateField });
        
        toast.success(`${type === 'logo' ? 'Logo' : 'Cover Photo'} updated!`, { id: toastId });
      } else {
        throw new Error("ImgBB upload rejected.");
      }
    } catch (error) {
      toast.error(`Failed to upload ${type}.`, { id: toastId });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsSaving(true);
    try {
      const shopRef = doc(db, "shops", shop.id);
      await updateDoc(shopRef, formData);
      setAuth(user, { ...shop, ...formData });
      toast.success("Shop details updated successfully!");
    } catch (error) {
      toast.error("Failed to update details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Store Profile</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your public storefront identity and details.</p>
      </div>

      {/* 1. Brand Identity (Dual Image Upload) */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200/60">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Monitor size={18} className="text-indigo-600"/> Storefront Visuals
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Cover Photo Uploader */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Banner</label>
            <p className="text-[11px] font-medium text-slate-400 mb-2 leading-relaxed">Displays at the top of your public store. Choose a wide landscape image (16:9).</p>
            
            {/* Aspect Video (16:9) frame to show exact crop */}
            <div className="w-full aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group">
              {isUploadingCover ? (
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              ) : shop?.coverPhotoUrl ? (
                <>
                  {/* object-cover ensures they see the exact crop */}
                  <img src={shop.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => coverInputRef.current?.click()} className="bg-black/70 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm">Change Cover</button>
                  </div>
                </>
              ) : (
                <button onClick={() => coverInputRef.current?.click()} className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-sm font-bold">Upload Cover</span>
                </button>
              )}
            </div>
            <input type="file" accept="image/*" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" />
          </div>

          {/* Square Logo Uploader */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Square Logo</label>
            <p className="text-[11px] font-medium text-slate-400 mb-2 leading-relaxed">Your primary brand icon. Will be displayed as a square overlapping the cover.</p>
            
            <div className="flex gap-6 items-center">
              {/* Aspect Square frame to show exact crop */}
              <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center shrink-0 overflow-hidden relative group">
                {isUploadingLogo ? (
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : shop?.shopLogoUrl ? (
                  <>
                    <img src={shop.shopLogoUrl} alt="Logo" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => logoInputRef.current?.click()} className="bg-black/70 p-2 rounded-xl text-white backdrop-blur-sm"><UploadCloud size={20}/></button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => logoInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Store size={32} />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                <button onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 active:scale-95 transition flex items-center gap-2 mb-3">
                  <UploadCloud size={16} /> Select Logo
                </button>
                <div className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-orange-400"/> Max 100KB</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400"/> JPG, PNG, WEBP</span>
                </div>
              </div>
            </div>
            <input type="file" accept="image/*" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
          </div>

        </div>
      </div>

      {/* 2. Business Details (Text Form) */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200/60">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Building size={18} className="text-indigo-600"/> Business Details
        </h3>
        
        <form onSubmit={handleUpdateDetails} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Shop Name</label>
            <input type="text" required value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:bg-slate-100/50" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Contact Number</label>
              <input type="text" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:bg-slate-100/50" />
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Business Category</label>
              <input type="text" value={formData.businessCategory} onChange={e => setFormData({...formData, businessCategory: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:bg-slate-100/50" placeholder="e.g. Pharmacy, Grocery..." />
            </div>
          </div>
          
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Complete Address</label>
            <input type="text" required value={formData.shopAddress} onChange={e => setFormData({...formData, shopAddress: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all hover:bg-slate-100/50" />
          </div>
          
          <div className="pt-4">
            <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-indigo-600 text-white text-sm font-bold px-10 py-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/30 flex justify-center items-center gap-2 disabled:opacity-70">
              {isSaving ? "Saving..." : <><Check size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Support & Logout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <a href="mailto:qurevotechnologies@gmail.com" className="flex items-center gap-4 p-5 bg-white hover:bg-slate-50 rounded-[1.5rem] transition border border-slate-200/60 shadow-sm group">
          <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><HelpCircle size={20} className="text-slate-500 group-hover:text-indigo-600" /></div>
          <div>
            <span className="block text-sm font-bold text-slate-900 mb-0.5">Email Support</span>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">qurevotechnologies@gmail.com</span>
          </div>
        </a>
        
        <button onClick={() => { logout(); auth.signOut(); }} className="flex items-center gap-4 p-5 bg-white hover:bg-red-50 rounded-[1.5rem] transition border border-slate-200/60 hover:border-red-200 shadow-sm group text-left">
          <div className="bg-red-50 p-3 rounded-xl group-hover:bg-red-100 transition-colors"><LogOut size={20} className="text-red-500" /></div>
          <div>
            <span className="block text-sm font-bold text-red-600 mb-0.5">Logout Securely</span>
            <span className="block text-[11px] font-bold text-slate-400 group-hover:text-red-400 uppercase tracking-wider transition-colors">End your current session</span>
          </div>
        </button>
      </div>
      
    </div>
  );
}