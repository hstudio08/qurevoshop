"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, Image as ImageIcon, CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore"; // Added this import

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "58724c8509a2aa71b59f73716b84db65";
const MAX_FILE_SIZE_KB = 95;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  editingProduct?: any | null;
}

export default function ProductModal({ isOpen, onClose, shopId, editingProduct }: ProductModalProps) {
  const { addProduct, updateProduct } = useProductStore();
  const { user } = useAuthStore(); // Grab the guaranteed Firebase user
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "", costPrice: "", sellingPrice: "", currentStock: "", batchNo: "", expiryDate: "", images: [] as string[]
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        costPrice: editingProduct.costPrice.toString(),
        sellingPrice: editingProduct.sellingPrice.toString(),
        currentStock: editingProduct.currentStock.toString(),
        batchNo: editingProduct.batchNo || "",
        expiryDate: editingProduct.expiryDate || "",
        images: editingProduct.images || []
      });
    } else {
      setFormData({ name: "", costPrice: "", sellingPrice: "", currentStock: "", batchNo: "", expiryDate: "", images: [] });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 500;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Compression failed"));
          }, "image/jpeg", 0.6);
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formData.images.length >= 2) return toast.error("Maximum 2 images allowed.");

    const uploadToast = toast.loading("Optimizing & Uploading...");
    try {
      const compressedBlob = await compressImage(file);
      const kbSize = compressedBlob.size / 1024;
      
      if (kbSize > MAX_FILE_SIZE_KB) {
        return toast.error(`Image still too large.`, { id: uploadToast });
      }

      const uploadData = new FormData();
      uploadData.append("image", compressedBlob, "product.jpg");
      
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: uploadData
      });
      const json = await res.json();
      
      if (json.success) {
        setFormData(prev => ({ ...prev, images: [...prev.images, json.data.display_url] }));
        toast.success("Image added!", { id: uploadToast });
      } else throw new Error("Upload failed");
    } catch (error) {
      toast.error("Failed to upload image", { id: uploadToast });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔥 THE FIX: Fallback to the guaranteed user.uid if shopId prop is broken
    const finalAuthId = user?.uid || shopId; 
    
    if (!finalAuthId) {
      toast.error("Authentication error. Please log out and log back in.");
      return;
    }

    setIsSubmitting(true);
    
    const payload: any = {
      shopId: finalAuthId, // Now 100% guaranteed to match request.auth.uid
      name: formData.name,
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      currentStock: Number(formData.currentStock),
      images: formData.images,
      updatedAt: new Date().toISOString()
    };
    
    if (formData.batchNo && formData.batchNo.trim() !== "") payload.batchNo = formData.batchNo;
    if (formData.expiryDate && formData.expiryDate.trim() !== "") payload.expiryDate = formData.expiryDate;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success("Product updated!");
      } else {
        payload.createdAt = new Date().toISOString();
        await addProduct(finalAuthId, payload);
        toast.success("Product added successfully!");
      }
      onClose();
    } catch (error: any) {
      console.error("Firebase save error:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const margin = Number(formData.sellingPrice) - Number(formData.costPrice);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md sm:max-w-lg rounded-[28px] shadow-2xl animate-in zoom-in-95 max-h-[85dvh] flex flex-col overflow-hidden">
        
        <div className="px-6 py-5 shrink-0 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{editingProduct ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full active:scale-90 transition"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Product Images (Max 2)</label>
              <div className="flex gap-3">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-gray-200 overflow-hidden shadow-sm shrink-0">
                    <img src={url} alt="Product" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full backdrop-blur-md active:scale-90"><X size={10}/></button>
                  </div>
                ))}
                
                {formData.images.length < 2 && (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition active:scale-95"
                  >
                    <Camera size={20} className="text-gray-400"/>
                    <span className="text-[9px] font-bold text-gray-400">Add Photo</span>
                  </button>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Product Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cost Price</label>
                <input type="number" required min="0" step="0.01" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm font-bold font-ibm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Selling Price</label>
                <input type="number" required min="0" step="0.01" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm font-bold font-ibm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Quantity</label>
                <input type="number" required min="0" value={formData.currentStock} onChange={(e) => setFormData({...formData, currentStock: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 text-sm font-bold font-ibm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              {!isNaN(margin) && formData.sellingPrice !== "" && formData.costPrice !== "" ? (
                <div className={`rounded-xl p-3.5 flex justify-between items-center border ${margin >= 0 ? 'bg-green-50 border-green-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Margin</span>
                  <span className="text-sm font-black font-ibm">₹{Math.abs(margin).toFixed(1)}</span>
                </div>
              ) : <div></div>}
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 mt-2">
               <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><AlertTriangle size={12}/> Optional Tracking</p>
               <div className="flex gap-3">
                <input type="text" placeholder="Batch No" value={formData.batchNo} onChange={(e) => setFormData({...formData, batchNo: e.target.value})} className="w-full border border-gray-200 bg-white rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-bold shadow-sm" />
                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full border border-gray-200 bg-white rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-bold shadow-sm" />
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-4 sm:p-6 shrink-0 border-t border-gray-100 bg-gray-50">
          <button form="product-form" type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2">
            {isSubmitting ? "Saving..." : <><CheckCircle size={18}/> {editingProduct ? "Save Changes" : "Add to Catalog"}</>}
          </button>
        </div>

      </div>
    </div>
  );
}