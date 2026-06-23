"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerShop } from "@/lib/firebase/authService";
import { Store, User, Building, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import emailjs from '@emailjs/browser';

export default function RegisterPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    ownerName: "", email: "", mobileNumber: "", personalAddress: "", password: "",
    shopName: "", shopAddress: "", state: "", country: "India", pincode: ""
  });

  // STEP 1: Generate and Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Sending verification code to your email...");

    try {
      // 1. Verify ENV variables are loaded
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS keys are missing from .env.local file.");
      }

      // 2. Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      // 3. Send OTP via EmailJS
      await emailjs.send(
        serviceId, 
        templateId,
        {
          to_email: formData.email, // Make sure your EmailJS OTP template uses {{to_email}}
          to_name: formData.ownerName, // Make sure your EmailJS OTP template uses {{to_name}}
          otp: otp,                 // Make sure your EmailJS OTP template uses {{otp}}
        },
        publicKey
      );

      toast.success("Verification code sent! Check your email.", { id: toastId });
      setStep(2); // Move to OTP verification screen
      
    } catch (error: any) {
      // EmailJS errors have 'status' and 'text' properties instead of a standard message
      const errorMsg = error?.text || error?.message || "Check console for details.";
      console.error("EmailJS Detailed Error:", error);
      toast.error(`Failed to send OTP: ${errorMsg}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP and Register Account
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userOtp !== generatedOtp) {
      return toast.error("Invalid OTP code. Please try again.");
    }

    setIsSubmitting(true);
    const loadingId = toast.loading("Verifying and setting up your store...");

    try {
      // 1. Register in Firebase
      await registerShop(formData); 
      
      // 2. Trigger Welcome Email in the background
      emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, 
        process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID!, 
        {
          user_email: formData.email,
          ownerName: formData.ownerName,
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          password: formData.password,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      toast.success("Account created successfully!", { id: loadingId });
      router.push("/dashboard");

    } catch (error: any) {
      toast.error(error.message || "Failed to register shop.", { id: loadingId });
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 font-sans text-slate-900 py-12">
      <div className="w-full max-w-2xl">
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-[#4F46E5] p-3 rounded-xl text-white shadow-sm mb-4">
            <Store size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Create your Store</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Join Qurevo to manage your business smarter</p>
        </div>

        {step === 1 ? (
          /* ==========================================
             STEP 1: DETAILS FORM
             ========================================== */
          <form onSubmit={handleSendOtp} className="space-y-6">
            {/* Personal Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                <User size={18} className="text-[#4F46E5]"/> Personal Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Your full name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="shop@example.com" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                    <input type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="+91 9876543210" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                <Building size={18} className="text-[#4F46E5]"/> Shop Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Shop Name</label>
                  <input type="text" name="shopName" required value={formData.shopName} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="e.g. Sharma General Store" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Shop Address</label>
                  <input type="text" name="shopAddress" required value={formData.shopAddress} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Complete shop address" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">State</label>
                    <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="State" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pincode</label>
                    <input type="text" name="pincode" required value={formData.pincode} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="e.g. 110001" />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Setup */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
                <ShieldCheck size={18} className="text-[#4F46E5]"/> Security Setup
              </h2>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Create Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Create a strong password" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#4F46E5] text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
              {isSubmitting ? "Sending OTP..." : <>Verify Email & Continue <ArrowRight size={18}/></>}
            </button>
          </form>
        ) : (
          /* ==========================================
             STEP 2: OTP VERIFICATION
             ========================================== */
          <form onSubmit={handleVerifyAndRegister} className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-6">
              <KeyRound size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Verify your Email</h2>
            <p className="text-sm font-medium text-slate-500 mb-8">We've sent a 6-digit code to <strong>{formData.email}</strong></p>
            
            <input 
              type="text" 
              required 
              maxLength={6}
              value={userOtp} 
              onChange={e => setUserOtp(e.target.value)} 
              className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl p-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:bg-white focus:border-[#4F46E5] transition-all mb-6" 
              placeholder="••••••" 
            />

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#4F46E5] text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98]">
              {isSubmitting ? "Creating Account..." : "Confirm & Create Store"}
            </button>
            
            <button type="button" onClick={() => setStep(1)} className="mt-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Change email address
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Already have an account? <Link href="/login" className="text-[#4F46E5] font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}