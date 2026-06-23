import { create } from "zustand";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where, writeBatch, doc } from "firebase/firestore";
import { Sale } from "@/types";
import { useProductStore } from "./useProductStore";

interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  fetchSales: (shopId: string) => Promise<void>;
  addSale: (shopId: string, saleData: any, cart: any[]) => Promise<void>;
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: [],
  isLoading: false,

  fetchSales: async (shopId) => {
    set({ isLoading: true });
    try {
      const q = query(collection(db, "sales"), where("shopId", "==", shopId));
      const snapshot = await getDocs(q);
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      })) as Sale[];
      
      salesData.sort((a, b) => b.date.getTime() - a.date.getTime());
      set({ sales: salesData });
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addSale: async (shopId, saleData, cart) => {
    try {
      const batch = writeBatch(db);
      
      // 1. Create the Sale Document
      const saleRef = doc(collection(db, "sales"));
      batch.set(saleRef, {
        ...saleData,
        id: saleRef.id,
      });

      // 2. Automatically Deduct Stock from Inventory
      cart.forEach((item) => {
         const productRef = doc(db, "products", item.productId);
         const newStock = item.maxStock - item.quantity;
         batch.update(productRef, { currentStock: newStock });
      });

      // 3. Commit to database
      await batch.commit();

      // 4. Update UI instantly
      const newSale = { id: saleRef.id, ...saleData } as Sale;
      set((state) => ({ sales: [newSale, ...state.sales] }));

      // 5. Refresh products in background so stock quantities update on screen
      useProductStore.getState().fetchProducts(shopId);

    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  }
}));