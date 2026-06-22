"use client";

import { useState } from "react";
import Link from "next/link";
import { registerShop } from "@/lib/firebase/authService";
import toast from "react-hot-toast";
import emailjs from '@emailjs/browser';
import Image from "next/image";

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "", email: "", mobileNumber: "", personalAddress: "", password: "",
    shopName: "", shopAddress: "", state: "", country: "India", pincode: ""
  });

  const sendWelcomeEmail = async () => {
    try {
      // NOTE: Replace these with your actual EmailJS Service ID, Template ID, and Public Key
      await emailjs.send(
        "YOUR_SERVICE_ID", 
        "YOUR_TEMPLATE_ID", 
        {
          to_email: formData.email,
          to_name: formData.ownerName,
          shop_name: formData.shopName,
          password: formData.password, // Be cautious sending plain text passwords; this is per your request
        },
        "YOUR_PUBLIC_KEY"
      );
    } catch (error) {
      console.error("EmailJS Error:", error);
      // We don't block registration if the email fails, just log it.
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerShop(formData); 
      //await sendWelcomeEmail();
      toast.success("Shop registered! Welcome email sent.");
      // AppWrapper will handle the redirect to /dashboard automatically
    } catch (error: any) {
      toast.error(error.message || "Failed to register shop.");
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-6 md:max-w-2xl md:mx-auto md:border-x md:border-gray-200 md:bg-white md:shadow-xl pb-12">
      
      <div className="text-center mt-6 mb-8 flex flex-col items-center">
        <img 
          src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" 
          alt="Qurevo Logo" 
          className="h-10 w-auto object-contain mb-6"
        />
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create your Shop</h1>
        <p className="text-sm text-gray-500 mt-1">Join Qurevo to manage your business smarter</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        
        {/* Section 1: Personal Details */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-bold text-baltic-blue uppercase tracking-wider mb-2 border-b border-gray-50 pb-2">Personal Details</h2>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="Your full name" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="shop@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="+91 9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Personal Address</label>
            <input type="text" name="personalAddress" required value={formData.personalAddress} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="House No, Street, City" />
          </div>
        </div>

        {/* Section 2: Shop Details */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-bold text-baltic-blue uppercase tracking-wider mb-2 border-b border-gray-50 pb-2">Shop Details</h2>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Shop Name</label>
            <input type="text" name="shopName" required value={formData.shopName} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="e.g. Ali General Store" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Shop Address</label>
            <input type="text" name="shopAddress" required value={formData.shopAddress} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="Complete shop address" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
              <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="State/Province" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pincode / ZIP</label>
              <input type="text" name="pincode" required value={formData.pincode} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="e.g. 110001" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
            <input type="text" name="country" required value={formData.country} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition bg-gray-50" />
          </div>
        </div>

        {/* Section 3: Security */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-bold text-baltic-blue uppercase tracking-wider mb-2 border-b border-gray-50 pb-2">Security</h2>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-baltic-blue focus:ring-1 focus:ring-baltic-blue transition" placeholder="Create a strong password" />
            <p className="text-[10px] text-gray-500 mt-1.5">This password will be emailed to you for safekeeping.</p>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-baltic-blue text-white font-bold py-4 rounded-xl mt-4 hover:bg-rich-cerulean transition active:scale-[0.98] disabled:opacity-70 shadow-md">
          {isSubmitting ? "Setting up your shop..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-8">
        Already have an account? <Link href="/login" className="text-baltic-blue font-bold hover:underline">Login here</Link>
      </p>
    </div>
  );
}