"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerShop } from "@/lib/firebase/authService";
import { Store, User, Building, ShieldCheck, ArrowRight, KeyRound, Mail, Phone, MapPin, Lock, Sparkles, CheckCircle2 } from "lucide-react";
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
    shopName: "", shopAddress: "", state: "", country: "India", pincode: "",
    isHidden: false // <-- Add this line right here
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Sending verification code to your email...");

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS keys are missing from .env.local file.");
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      await emailjs.send(
        serviceId, 
        templateId,
        {
          to_email: formData.email, 
          to_name: formData.ownerName, 
          otp: otp,                 
        },
        publicKey
      );

      toast.success("Verification code sent! Check your email.", { id: toastId });
      setStep(2); 
      
    } catch (error: any) {
      const errorMsg = error?.text || error?.message || "Check console for details.";
      console.error("EmailJS Detailed Error:", error);
      toast.error(`Failed to send OTP: ${errorMsg}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userOtp !== generatedOtp) {
      return toast.error("Invalid OTP code. Please try again.");
    }

    setIsSubmitting(true);
    const loadingId = toast.loading("Verifying and setting up your store...");

    try {
      await registerShop(formData); 
      
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
    <>
      {/* Integrating Google Sans & Custom Animations directly */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap');
        
        .font-google-sans {
          font-family: "Google Sans", sans-serif;
          font-optical-sizing: auto;
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />

      <div className="min-h-screen font-google-sans flex items-center justify-center bg-blue-50/50 relative overflow-hidden p-4 sm:p-8 py-12 selection:bg-indigo-200 selection:text-indigo-900">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 sm:w-96 sm:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

        {/* Glassmorphism Main Container */}
        <div className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] rounded-[2.5rem] overflow-hidden z-10">
          
          {/* Left Panel - Branding (Hidden on Mobile) */}
          <div className="hidden lg:flex w-1/3 xl:w-2/5 flex-col justify-between p-12 bg-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-[2px]"></div>
            
           <div className="relative z-10 flex items-center gap-3 text-indigo-700">
              <img 
                src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782737224/5_6204139598340171967_lr0yaf.png" 
                alt="Qurevo Logo" 
                className="w-40 sm:w-48 h-auto object-contain drop-shadow-sm" 
              />
            </div>

            <div className="relative z-10 mt-auto mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-indigo-600 text-sm font-bold mb-6 shadow-sm">
                <Sparkles size={16} /> Build your empire
              </div>
              <h2 className="text-5xl font-black text-slate-800 leading-[1.1] mb-6">
                Start your <br/> journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">today.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-md font-medium leading-relaxed">
                Join thousands of merchants who trust Qurevo to scale their businesses effortlessly.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  "All-in-one powerful dashboard",
                  "Real-time analytics & reporting",
                  "Enterprise-grade security"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="bg-indigo-100 p-1 rounded-full text-indigo-600">
                      <CheckCircle2 size={16} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative z-10 text-sm font-medium text-slate-500">
              © {new Date().getFullYear()} Qurevo Inc. All rights reserved.
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full lg:w-2/3 xl:w-3/5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white/50 relative">
            
            <div className="w-full max-w-2xl mx-auto">
              {/* Header */}
              <div className="mb-8 lg:mb-10 text-center lg:text-left flex flex-col items-center lg:items-start">
                <img 
                  src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782737224/5_6204139598340171967_lr0yaf.png" 
                  alt="Qurevo Logo" 
                  className="lg:hidden w-40 h-auto mb-6 drop-shadow-md" 
                />
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800">Create your Store</h1>
                <p className="text-sm sm:text-base font-medium text-slate-500 mt-2">Join Qurevo to manage your business smarter</p>
              </div>

              {/* Modern Stepper */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white/60 text-slate-500 border border-white/80'}`}>
                  <span className="text-sm font-bold">1. Details</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300/50 rounded-full"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === 2 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white/60 text-slate-500 border border-white/80'}`}>
                  <span className="text-sm font-bold">2. Verification</span>
                </div>
              </div>

              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  
                  {/* Form Container */}
                  <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-8">
                    
                    {/* Section 1: Personal Details */}
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><User size={16}/></div> Personal Information
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 group">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-600">Full Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110"><User size={16} className="text-slate-400 group-focus-within:text-indigo-500" /></div>
                            <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="Enter your full name" />
                          </div>
                        </div>
                        <div className="group">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-600">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110"><Mail size={16} className="text-slate-400 group-focus-within:text-indigo-500" /></div>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="shop@example.com" />
                          </div>
                        </div>
                        <div className="group">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-600">Phone Number</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110"><Phone size={16} className="text-slate-400 group-focus-within:text-indigo-500" /></div>
                            <input type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="+91 9876543210" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                    {/* Section 2: Shop Details */}
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Building size={16}/></div> Business Details
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 group">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-purple-600">Shop Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110"><Store size={16} className="text-slate-400 group-focus-within:text-purple-500" /></div>
                            <input type="text" name="shopName" required value={formData.shopName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="e.g. Sharma General Store" />
                          </div>
                        </div>
                        <div className="sm:col-span-2 group">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-purple-600">Complete Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110"><MapPin size={16} className="text-slate-400 group-focus-within:text-purple-500" /></div>
                            <input type="text" name="shopAddress" required value={formData.shopAddress} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="Street address, landmark, etc." />
                          </div>
                        </div>
                        <div className="group">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-purple-600">State</label>
                          <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="State" />
                        </div>
                        <div className="group">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-purple-600">Pincode</label>
                          <input type="text" name="pincode" required value={formData.pincode} onChange={handleChange} className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="e.g. 110001" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                    {/* Section 3: Security */}
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><ShieldCheck size={16}/></div> Security Setup
                      </h2>
                      <div className="group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">Create Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110"><Lock size={16} className="text-slate-400 group-focus-within:text-blue-500" /></div>
                          <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/80 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm hover:bg-white/80" placeholder="Create a strong password" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 w-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    {isSubmitting ? "Sending OTP..." : <>Verify Email & Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndRegister} className="bg-white/40 backdrop-blur-md p-8 sm:p-12 rounded-[2.5rem] shadow-sm border border-white/60 max-w-md mx-auto text-center relative overflow-hidden">
                  <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                    <KeyRound size={36} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Verify your Email</h2>
                  <p className="text-sm font-medium text-slate-500 mb-8">We've sent a 6-digit code to <br/><strong className="text-slate-800">{formData.email}</strong></p>
                  
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    value={userOtp} 
                    onChange={e => setUserOtp(e.target.value)} 
                    className="w-full bg-white/60 backdrop-blur-sm border-2 border-white/80 rounded-2xl p-4 text-center text-3xl font-black text-slate-800 tracking-[0.7em] outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all mb-8 shadow-inner hover:bg-white/80" 
                    placeholder="••••••" 
                  />

                  <button type="submit" disabled={isSubmitting} className="w-full group bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all active:scale-[0.98] relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 w-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    {isSubmitting ? "Creating Account..." : "Confirm & Create Store"}
                  </button>
                  
                  <button type="button" onClick={() => setStep(1)} className="mt-6 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                    Wrong email? Go back
                  </button>
                </form>
              )}

              <p className="text-center text-sm text-slate-600 mt-8 font-medium">
                Already have an account? <Link href="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:opacity-80 transition-opacity">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}