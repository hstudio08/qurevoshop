import { db } from "./config";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { Product } from "@/types";
import { deleteDoc, updateDoc, doc } from "firebase/firestore";

export const addProductToDB = async (shopId: string, data: Omit<Product, "id" | "shopId" | "updatedAt">) => {
  const productsRef = collection(db, "products");
  
  // What we send to Firestore (uses Firebase's internal timestamp)
  const firestoreData = {
    ...data,
    shopId,
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(productsRef, firestoreData);
  
  // What we return to Zustand state (uses standard JS Date to satisfy TypeScript)
  return { 
    id: docRef.id, 
    ...data, 
    shopId, 
    updatedAt: new Date() 
  } as Product;
};

export const updateProductInDB = async (productId: string, data: Partial<Product>) => {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteProductFromDB = async (productId: string) => {
  await deleteDoc(doc(db, "products", productId));
};

export const getShopProducts = async (shopId: string): Promise<Product[]> => {
  const productsRef = collection(db, "products");
  const q = query(productsRef, where("shopId", "==", shopId));
  
  const querySnapshot = await getDocs(q);
  const products: Product[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    products.push({ 
      id: doc.id, 
      ...data,
      // Convert Firebase Timestamp back to a normal JS Date
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Product);
  });
  
  return products;
};