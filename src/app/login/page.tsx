"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Fingerprint } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingId = toast.loading("Authenticating...");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check Role for Routing
      const shopDoc = await getDoc(doc(db, "shops", userCredential.user.uid));
      const role = shopDoc.data()?.role;

      toast.success(role === "Admin" ? "Welcome, Super Admin!" : "Welcome back!", { id: loadingId });
      
      // Force instant route
      if (role === "Admin") router.push("/admin");
      else router.push("/dashboard");

    } catch (error: any) {
      toast.error("Invalid credentials or account suspended.", { id: loadingId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskeyLogin = () => {
    // Note: To fully activate this, you must enable "Passkeys" in Firebase Authentication > Sign-in Method.
    toast("Passkey verification triggered. Use fingerprint or FaceID.", { icon: "🔐" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 p-6 md:max-w-md md:mx-auto relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      
      <div className="relative z-10 w-full">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" alt="Qurevo Logo" className="h-10 w-auto object-contain mb-6 drop-shadow-sm" />
          <h1 className="text-2xl font-black text-gray-900 font-bebas tracking-wide">Welcome Back</h1>
          <p className="text-xs text-gray-500 mt-1">Sign in to your Qurevo account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-baltic-blue transition-all" placeholder="admin@qurevo.in" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <span className="text-[10px] text-rich-cerulean font-bold cursor-pointer">Forgot?</span>
            </div>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-baltic-blue transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-baltic-blue text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-rich-cerulean transition-all active:scale-[0.98] disabled:opacity-70 mt-2">
            {isSubmitting ? "Authenticating..." : "Login Securely"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Passkey Integration Button */}
          <button type="button" onClick={handlePasskeyLogin} className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-800 border border-gray-200 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98]">
            <Fingerprint size={18} className="text-baltic-blue" /> Sign in with Passkey
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6 font-medium">
          Don't have a shop yet? <Link href="/register" className="text-baltic-blue font-black">Create Account</Link>
        </p>
      </div>
    </div>
  );
}