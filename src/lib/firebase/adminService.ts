import { db } from "./config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Shop } from "@/types";

export const getAllPlatformShops = async (): Promise<Shop[]> => {
  const shopsRef = collection(db, "shops");
  const snapshot = await getDocs(shopsRef);
  const shops: Shop[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    // Do NOT filter out hidden shops here; Super Admin needs to see everything!
    shops.push({ ...data, id: doc.id, createdAt: data.createdAt?.toDate() || new Date() } as Shop);
  });
  return shops;
};

export const toggleShopStatusDB = async (shopId: string, currentStatus: boolean) => {
  const shopRef = doc(db, "shops", shopId);
  await updateDoc(shopRef, { isActive: !currentStatus });
};

export const hideShopFromDB = async (shopId: string) => {
  const shopRef = doc(db, "shops", shopId);
  await updateDoc(shopRef, { isHidden: true, isActive: false }); // Soft delete & Suspend
};

export const restoreShopFromDB = async (shopId: string) => {
  const shopRef = doc(db, "shops", shopId);
  await updateDoc(shopRef, { isHidden: false, isActive: true }); // Unhide & Reactivate
};