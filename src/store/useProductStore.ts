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

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  fetchProducts: async (shopId) => {
    set({ isLoading: true });
    try {
      const data = await getShopProducts(shopId);
      set({ products: data, isLoading: false });
    } catch (error) { set({ isLoading: false }); }
  },
  addProduct: async (shopId, productData) => {
    const newProduct = await addProductToDB(shopId, productData);
    set((state) => ({ products: [...state.products, newProduct] }));
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