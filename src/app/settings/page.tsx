"use client";

import { useState, useRef } from "react";
import { Building, LogOut, Check, HelpCircle, Store, UploadCloud, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { db, auth } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { shop, user, setAuth, logout } = useAuthStore();
  
  // State for Image Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for Text Form
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: shop?.shopName || "",
    mobileNumber: shop?.mobileNumber || "",
    shopAddress: shop?.shopAddress || "",
    businessCategory: shop?.businessCategory || "",
  });

  // --- IMAGE UPLOAD LOGIC ---
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY_HERE";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shop?.id) return;

    // Strict 100KB limit
    if (file.size > 100 * 1024) {
      toast.error("Image is too large! Must be under 100KB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading store identity...");

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
        await updateDoc(doc(db, "shops", shop.id), { shopLogoUrl: imageUrl });
        
        // Update Local State
        if (user) setAuth(user, { ...shop, shopLogoUrl: imageUrl });
        toast.success("Store logo updated!", { id: toastId });
      } else {
        throw new Error("ImgBB upload rejected.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image. Check API key.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- TEXT FORM LOGIC ---
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
    <div className="max-w-3xl mx-auto space-y-6 pb-24 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings & Profile</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your business information and public identity.</p>
      </div>

      {/* 1. Brand Identity (Image Upload) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Store size={18} className="text-indigo-600"/> Public Storefront Logo
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center shrink-0 overflow-hidden relative">
            {isUploading ? (
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            ) : shop?.shopLogoUrl ? (
              <img src={shop.shopLogoUrl} alt="Store Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={32} className="text-slate-300" />
            )}
          </div>

          <div className="flex-1">
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-fit bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 active:scale-95 transition flex items-center gap-2 disabled:opacity-50 mb-3"
            >
              <UploadCloud size={16} /> {isUploading ? "Uploading..." : "Select Logo"}
            </button>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1"><AlertCircle size={14} className="text-orange-400"/> Max 100KB</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400"/> JPG, PNG, WEBP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Business Details (Text Form) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Building size={18} className="text-indigo-600"/> Business Details
        </h3>
        
        <form onSubmit={handleUpdateDetails} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Shop Name</label>
            <input type="text" required value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contact Number</label>
              <input type="text" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Business Category</label>
              <input type="text" value={formData.businessCategory} onChange={e => setFormData({...formData, businessCategory: e.target.value})} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="e.g. Pharmacy, Grocery..." />
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Shop Address</label>
            <input type="text" required value={formData.shopAddress} onChange={e => setFormData({...formData, shopAddress: e.target.value})} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>
          
          <div className="pt-2">
            <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-indigo-600 text-white text-sm font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-70">
              {isSaving ? "Saving..." : <><Check size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Support & Logout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <a href="mailto:qurevotechnologies@gmail.com" className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 rounded-2xl transition border border-slate-200 shadow-sm">
          <div className="bg-slate-100 p-2 rounded-lg"><HelpCircle size={18} className="text-slate-600" /></div>
          <div>
            <span className="block text-sm font-bold text-slate-900">Email Support</span>
            <span className="block text-xs font-medium text-slate-500">qurevotechnologies@gmail.com</span>
          </div>
        </a>
        
        <button onClick={() => { logout(); auth.signOut(); }} className="flex items-center gap-3 p-4 bg-white hover:bg-red-50 rounded-2xl transition border border-slate-200 hover:border-red-200 shadow-sm group">
          <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors"><LogOut size={18} className="text-red-600" /></div>
          <div className="text-left">
            <span className="block text-sm font-bold text-red-600">Logout Securely</span>
            <span className="block text-xs font-medium text-slate-500 group-hover:text-red-400">End your current session</span>
          </div>
        </button>
      </div>
      
    </div>
  );
}