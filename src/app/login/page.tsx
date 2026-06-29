"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Fingerprint, Store, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasPasskey, setHasPasskey] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasPasskey(!!localStorage.getItem("admin_passkey_id"));
    }
  }, []);

  const routeUser = async (userUid: string) => {
    const shopDoc = await getDoc(doc(db, "shops", userUid));
    const role = shopDoc.data()?.role;
    
    if (email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || role === "Admin") {
      toast.success("Welcome, Super Admin!");
      router.push("/admin");
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingId = toast.loading("Authenticating...");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.dismiss(loadingId);
      await routeUser(userCredential.user.uid);
    } catch (error: any) {
      toast.error("Invalid credentials or account suspended.", { id: loadingId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskeyLogin = async () => {
    const rawId = localStorage.getItem("admin_passkey_id");
    const adminEmail = localStorage.getItem("admin_passkey_email");
    
    if (!rawId || !adminEmail) return toast.error("No passkey found on this device.");

    try {
      const idBuffer = Uint8Array.from(atob(rawId), c => c.charCodeAt(0));
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from("QurevoSecureChallenge123", c => c.charCodeAt(0)),
        allowCredentials: [{ id: idBuffer, type: "public-key" }],
        userVerification: "required",
        timeout: 60000
      };

      await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
      
      const adminPwd = prompt("Biometric Verified! Enter Super Admin Password to initialize secure session:");
      
      if (adminPwd) {
        const loadingId = toast.loading("Initializing Secure Admin Session...");
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPwd);
        toast.dismiss(loadingId);
        await routeUser(userCredential.user.uid);
      }
      
    } catch (error) {
      toast.error("Biometric verification failed or cancelled.");
    }
  };

  return (
    <>
      {/* Integrating Google Sans & Custom Animations directly for this page */}
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

      <div className="min-h-screen font-google-sans flex items-center justify-center bg-blue-50/50 relative overflow-hidden p-4 sm:p-8 selection:bg-indigo-200 selection:text-indigo-900">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 sm:w-96 sm:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

        {/* Glassmorphism Main Container */}
        <div className="relative w-full max-w-5xl flex flex-col lg:flex-row bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] rounded-[2.5rem] overflow-hidden z-10">
          
          {/* Left Panel - Branding (Hidden on Mobile) */}
          <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-[2px]"></div>
            
            <div className="relative z-10 flex items-center gap-3 text-indigo-700">
            <img 
              src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782737224/5_6204139598340171967_lr0yaf.png" 
              alt="Qurevo Logo" 
              className="w-30 sm:w-35 h-auto object-contain drop-shadow-sm" 
            />
            </div>

            <div className="relative z-10 mt-auto mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-indigo-600 text-sm font-bold mb-6 shadow-sm">
                <Sparkles size={16} /> Welcome to the future
              </div>
              <h2 className="text-5xl font-black text-slate-800 leading-[1.1] mb-6">
                Manage your <br/> business <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">smarter.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-md font-medium leading-relaxed">
                Access your dashboard, manage sales, and monitor your store's growth all in one secure, beautiful place.
              </p>
            </div>
            
            <div className="relative z-10 text-sm font-medium text-slate-500">
              © {new Date().getFullYear()} Qurevo Inc. All rights reserved.
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/50 relative">
            
            <div className="w-full max-w-md mx-auto">
              {/* Mobile Only Header */}
              <div className="mb-10 lg:hidden flex flex-col items-center text-center">
                <img 
                  src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782737224/5_6204139598340171967_lr0yaf.png" 
                  alt="Qurevo Logo" 
                  className="w-40 h-auto mb-6 drop-shadow-md" 
                />
                <h1 className="text-3xl font-black tracking-tight text-slate-800">Welcome Back</h1>
                <p className="text-sm font-medium text-slate-500 mt-2">Sign in to your Qurevo dashboard</p>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-800">Sign In</h1>
                <p className="text-base font-medium text-slate-500 mt-2">Enter your credentials to securely access your account.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-indigo-600">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                      <Mail size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:bg-white/80" 
                      placeholder="name@store.com" 
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-indigo-600">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                      <Lock size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full pl-11 pr-4 py-3.5 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm hover:bg-white/80" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 mt-4 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                  {isSubmitting ? "Authenticating..." : <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>

                {hasPasskey && (
                  <>
                    <div className="relative flex items-center py-4">
                      <div className="flex-grow border-t border-slate-200/60"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest bg-white/50 px-2 rounded-full backdrop-blur-sm">OR</span>
                      <div className="flex-grow border-t border-slate-200/60"></div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handlePasskeyLogin} 
                      className="w-full group flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border border-indigo-100 text-indigo-700 font-bold py-3.5 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-[0.98] shadow-sm"
                    >
                      <Fingerprint size={20} className="text-indigo-500 group-hover:scale-110 transition-transform" /> Biometric Unlock
                    </button>
                  </>
                )}
              </form>

              <p className="text-center text-sm text-slate-600 mt-10 font-medium">
                Don't have a shop yet? <Link href="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:opacity-80 transition-opacity">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}