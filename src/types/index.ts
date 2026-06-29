export interface Product {
  id: string;
  shopId: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  batchNo?: string;
  expiryDate?: string;
  images?: string[]; // Array of ImgBB URLs (Max 2)
  createdAt: string | Date;
  updatedAt: string | Date;
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
  date: string | Date;
  invoiceNumber?: string;
}

export interface Shop {
  id: string;
  ownerUid?: string;
  ownerName: string;
  email: string;
  mobileNumber?: string;
  personalAddress?: string;
  shopName: string;
  shopAddress?: string;
  state?: string;
  country?: string;
  pincode?: string;
  businessCategory?: string;
  role: "Shopkeeper" | "Admin" | "ShopOwner";
  isActive?: boolean;
  isHidden?: boolean;
  createdAt?: string | Date;
  shopLogoUrl?: string;
  coverPhotoUrl?: string;
}