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

export interface Sale {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // NEW: To track custom bargained price
  totalAmount: number;
  profit: number;
  customerName?: string;
  customerAddress?: string; // NEW: For Invoices
  paymentMethod: "Cash" | "Online" | "Credit";
  date: Date;
}