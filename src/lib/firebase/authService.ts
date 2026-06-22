import { auth, db } from "./config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Shop } from "@/types";

export const registerShop = async (data: any) => {
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const uid = userCredential.user.uid;

  const shopData: Shop = {
    id: uid, 
    ownerUid: uid,
    ownerName: data.ownerName,
    email: data.email,
    mobileNumber: data.mobileNumber,
    personalAddress: data.personalAddress,
    shopName: data.shopName,
    shopAddress: data.shopAddress,
    state: data.state,
    country: data.country || "India",
    pincode: data.pincode,
    businessCategory: data.businessCategory || "Retail",
    role: data.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ? "Admin" : "ShopOwner",
    isActive: true,
    createdAt: new Date(),
  };

  await setDoc(doc(db, "shops", uid), {
    ...shopData,
    createdAt: new Date(), 
  });

  return { user: userCredential.user, shop: shopData };
};

export const getShopDetails = async (uid: string, email?: string | null): Promise<Shop | null> => {
  // HARDCODED OVERRIDE: Intercept the predefined Super Admin Email
  if (email && email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    return {
      id: uid,
      ownerUid: uid,
      ownerName: "Haadi (Super Admin)",
      shopName: "QUREVO SYSTEM",
      email: email,
      role: "Admin",
      mobileNumber: "SECURED",
      personalAddress: "SECURED",
      shopAddress: "Global Administration",
      state: "N/A",
      country: "India",
      pincode: "N/A",
      businessCategory: "Platform Administration",
      isActive: true,
      createdAt: new Date(),
    } as Shop;
  }

  const docRef = doc(db, "shops", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as Shop;
  }
  return null;
};