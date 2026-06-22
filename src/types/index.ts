export type Role = "ShopOwner" | "Admin";

export interface Shop {
  id: string; 
  ownerUid: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  personalAddress: string;
  shopName: string;
  shopAddress: string;
  state: string;
  country: string;
  pincode: string;
  businessCategory: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  shopLogoUrl?: string; // NEW: Custom shop logo
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  category?: string;
  description?: string;
  updatedAt: Date;
}

// Add this interface
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

// Update the Sale interface
export interface Sale {
  id: string;
  shopId: string;
  items: SaleItem[]; // Replaces productId, productName, quantity, unitPrice
  totalAmount: number;
  profit: number;
  customerName?: string;
  customerAddress?: string;
  paymentMethod: "Cash" | "Online" | "Credit";
  date: Date;
  invoiceNumber?: string; // New Invoice Number
}
// Keep your other interfaces (Shop, Product, etc.) exactly the same.