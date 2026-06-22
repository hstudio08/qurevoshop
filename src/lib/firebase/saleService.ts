import { db } from "./config";
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp, getDocs, query, where, orderBy, deleteDoc } from "firebase/firestore";
import { Sale } from "@/types";

export const recordSaleToDB = async (shopId: string, saleData: Omit<Sale, "id" | "shopId" | "date">, currentStock: number) => {
  const salesRef = collection(db, "sales");
  
  const newSale = {
    ...saleData,
    shopId,
    date: serverTimestamp(),
  };
  const docRef = await addDoc(salesRef, newSale);

  const productRef = doc(db, "products", saleData.productId);
  await updateDoc(productRef, {
    currentStock: increment(-saleData.quantity)
  });

  return { id: docRef.id, ...saleData, shopId, date: new Date() } as Sale;
};

export const getShopSales = async (shopId: string): Promise<Sale[]> => {
  const salesRef = collection(db, "sales");
  const q = query(salesRef, where("shopId", "==", shopId), orderBy("date", "desc"));
  
  const querySnapshot = await getDocs(q);
  const sales: Sale[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    sales.push({ id: doc.id, ...data, date: data.date?.toDate() || new Date() } as Sale);
  });
  
  return sales;
};

export const deleteSaleFromDB = async (saleId: string, productId: string, quantity: number) => {
  await deleteDoc(doc(db, "sales", saleId));
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, { currentStock: increment(quantity) });
};