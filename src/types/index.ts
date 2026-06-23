// Add batchNo and expiryDate to Product
export interface Product {
  id: string;
  shopId: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  batchNo?: string;
  expiryDate?: string;
  images?: string[]; // <-- NEW: Array of ImgBB URLs (Max 2)
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface Sale {
  id: string;
  shopId: string;
  items: SaleItem[]; 
  totalAmount: number;
  profit: number;
  customerName?: string;
  customerAddress?: string;
  paymentMethod: "Cash" | "Online" | "Credit";
  date: Date;
  invoiceNumber?: string;
}

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
  role: "ShopOwner" | "Admin";
  isActive: boolean;
  isHidden?: boolean;
  createdAt: Date;
  shopLogoUrl?: string;
}