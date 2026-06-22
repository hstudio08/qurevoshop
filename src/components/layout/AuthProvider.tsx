"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getShopDetails } from "@/lib/firebase/authService";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const shopDetails = await getShopDetails(user.uid);
        setAuth(user, shopDetails);
      } else {
        setAuth(null, null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuth, setLoading]);

  return <>{children}</>;
}