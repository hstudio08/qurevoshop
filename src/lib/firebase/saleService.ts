import { db } from "./config";
import { collection, doc, writeBatch, serverTimestamp, getDocs, query, where, orderBy, limit, deleteDoc, increment } from "firebase/firestore";
import { Sale, SaleItem } from "@/types";

// 1. Record a multi-item sale using an Atomic Batch Write
export const recordSaleToDB = async (shopId: string, items: SaleItem[], saleData: any) => {
  const batch = writeBatch(db);
  const salesRef = doc(collection(db, "sales")); // Auto-generate ID
  
  const newSale = {
    ...saleData,
    items,
    shopId,
    date: serverTimestamp(),
  };

  // Add the sale document to the batch
  batch.set(salesRef, newSale);

  // Add all inventory stock reductions to the batch
  items.forEach((item) => {
    const productRef = doc(db, "products", item.productId);
    batch.update(productRef, { currentStock: increment(-item.quantity) });
  });

  await batch.commit(); // Executes all or nothing!

  return { id: salesRef.id, ...newSale, date: new Date() } as Sale;
};

// 2. Fetch sales with Pagination (limit)
export const getShopSales = async (shopId: string, fetchLimit: number = 20): Promise<Sale[]> => {
  const salesRef = collection(db, "sales");
  const q = query(salesRef, where("shopId", "==", shopId), orderBy("date", "desc"), limit(fetchLimit));
  
  const querySnapshot = await getDocs(q);
  const sales: Sale[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    sales.push({ id: doc.id, ...data, date: data.date?.toDate() || new Date() } as Sale);
  });
  return sales;
};

// 3. Delete a multi-item sale (Undo)
export const deleteSaleFromDB = async (saleId: string, items: SaleItem[]) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, "sales", saleId));

  items.forEach((item) => {
    const productRef = doc(db, "products", item.productId);
    batch.update(productRef, { currentStock: increment(item.quantity) }); // Restore stock
  });

  await batch.commit();
};