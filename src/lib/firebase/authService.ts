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
    role: "ShopOwner",
    isActive: true,
    createdAt: new Date(),
  };

  await setDoc(doc(db, "shops", uid), {
    ...shopData,
    createdAt: new Date(), 
  });

  return { user: userCredential.user, shop: shopData };
};

export const getShopDetails = async (uid: string): Promise<Shop | null> => {
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