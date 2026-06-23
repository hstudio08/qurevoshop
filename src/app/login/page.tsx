"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Fingerprint, Store } from "lucide-react";
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 font-sans text-slate-900">
      
      <div className="w-full max-w-md">
        {/* Minimal Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-sm mb-4">
            <Store size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Welcome Back</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Sign in to your Qurevo dashboard</p>
        </div>

        {/* Clean Form Card */}
        <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              placeholder="name@store.com" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 mt-2 shadow-sm"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>

          {/* Passkey Integration */}
          {hasPasskey && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button 
                type="button" 
                onClick={handlePasskeyLogin} 
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
              >
                <Fingerprint size={18} className="text-indigo-400" /> Biometric Unlock
              </button>
            </>
          )}
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Don't have a shop yet? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}