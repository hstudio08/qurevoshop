"use client";

import { useState } from "react";
import { Building, LogOut, ChevronRight, Check, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { db, auth } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { shop, user, setAuth, logout } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: shop?.shopName || "",
    mobileNumber: shop?.mobileNumber || "",
    shopAddress: shop?.shopAddress || "",
    businessCategory: shop?.businessCategory || "",
  });

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 font-bebas tracking-wide">Settings & Profile</h1>
        <p className="text-xs text-gray-500">Manage your business information directly.</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Building size={16} className="text-baltic-blue"/> Business Details</h3>
        
        <form onSubmit={handleUpdateDetails} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shop Name</label>
            <input type="text" required value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-baltic-blue font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Number</label>
              <input type="text" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-baltic-blue font-bold" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Business Category</label>
              <input type="text" value={formData.businessCategory} onChange={e => setFormData({...formData, businessCategory: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-baltic-blue font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shop Address</label>
            <input type="text" required value={formData.shopAddress} onChange={e => setFormData({...formData, shopAddress: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-baltic-blue font-bold" />
          </div>
          
          <button type="submit" disabled={isSaving} className="w-full bg-baltic-blue text-white text-sm font-bold py-3 rounded-lg mt-2 hover:bg-rich-cerulean transition flex justify-center items-center gap-2">
            {isSaving ? "Saving..." : <><Check size={16} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Support & Logout */}
      <div className="grid grid-cols-2 gap-4">
        <a href="mailto:qurevotechnologies@gmail.com" className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-200">
          <HelpCircle size={18} className="text-gray-500" />
          <span className="text-sm font-bold text-gray-700">Email Support</span>
        </a>
        <button onClick={() => { logout(); auth.signOut(); }} className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-100">
          <LogOut size={18} className="text-red-500" />
          <span className="text-sm font-bold text-red-600">Logout</span>
        </button>
      </div>
    </div>
  );
}