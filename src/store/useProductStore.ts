import { create } from "zustand";
import { Product } from "@/types";
import { getShopProducts, addProductToDB, updateProductInDB, deleteProductFromDB } from "@/lib/firebase/productService";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (shopId: string) => Promise<void>;
  addProduct: (shopId: string, product: Omit<Product, "id" | "shopId" | "updatedAt">) => Promise<void>;
  updateProduct: (productId: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  fetchProducts: async (shopId) => {
    // DEBUG: Check what ID is being passed
    console.log("🔵 [Zustand] fetchProducts Triggered for Shop ID:", shopId);
    
    if (!shopId) {
      console.warn("🔴 [Zustand] fetchProducts aborted: shopId is undefined/null");
      return; 
    }

    if (get().products.length === 0) {
      set({ isLoading: true });
    }
    
    try {
      const data = await getShopProducts(shopId);
      console.log("🟢 [Zustand] Firebase returned products:", data);
      set({ products: data, isLoading: false });
    } catch (error) { 
      console.error("🔴 [Zustand] Firebase Fetch Error:", error);
      set({ isLoading: false }); 
    }
  },
  addProduct: async (shopId, productData) => {
    console.log("🔵 [Zustand] Adding new product optimistically...");
    const newProduct = await addProductToDB(shopId, productData);
    set((state) => {
      console.log("🟢 [Zustand] New product added to state:", newProduct);
      return { products: [newProduct, ...state.products] };
    });
  },
  updateProduct: async (productId, data) => {
    await updateProductInDB(productId, data);
    set((state) => ({
      products: state.products.map(p => p.id === productId ? { ...p, ...data } : p)
    }));
  },
  deleteProduct: async (productId) => {
    await deleteProductFromDB(productId);
    set((state) => ({ products: state.products.filter(p => p.id !== productId) }));
  }
}));