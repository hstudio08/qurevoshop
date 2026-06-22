import { create } from "zustand";
import { Sale } from "@/types";
import { getShopSales, deleteSaleFromDB } from "@/lib/firebase/saleService";

interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  fetchSales: (shopId: string) => Promise<void>;
  deleteSale: (saleId: string, productId: string, quantity: number) => Promise<void>;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  isLoading: false,
  
  fetchSales: async (shopId: string) => {
    set({ isLoading: true });
    try {
      const data = await getShopSales(shopId);
      set({ sales: data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      set({ isLoading: false });
    }
  },

  deleteSale: async (saleId: string, productId: string, quantity: number) => {
    try {
      await deleteSaleFromDB(saleId, productId, quantity);
      // Remove the sale from local state to update UI instantly
      set((state) => ({
        sales: state.sales.filter((sale) => sale.id !== saleId)
      }));
    } catch (error) {
      console.error("Failed to delete sale:", error);
      throw error;
    }
  }
}));