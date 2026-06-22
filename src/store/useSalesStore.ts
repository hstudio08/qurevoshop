import { create } from "zustand";
import { Sale, SaleItem } from "@/types";
import { getShopSales, deleteSaleFromDB } from "@/lib/firebase/saleService";

interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  fetchSales: (shopId: string, fetchLimit?: number) => Promise<void>;
  deleteSale: (saleId: string, items: SaleItem[]) => Promise<void>;
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: [],
  isLoading: false,
  
  fetchSales: async (shopId: string, fetchLimit: number = 20) => {
    set({ isLoading: true });
    try {
      const data = await getShopSales(shopId, fetchLimit);
      set({ sales: data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      set({ isLoading: false });
    }
  },

  deleteSale: async (saleId: string, items: SaleItem[]) => {
    try {
      await deleteSaleFromDB(saleId, items);
      set((state) => ({
        sales: state.sales.filter((sale) => sale.id !== saleId)
      }));
    } catch (error) {
      console.error("Failed to delete sale:", error);
      throw error;
    }
  }
}));