import { create } from "zustand";
import { getShopCredits, addCreditCustomerToDB, recordPaymentInDB } from "@/lib/firebase/creditService";

export interface CreditAccount {
  id: string;
  customerName: string;
  totalDue: number;
  lastTransactionDate: Date;
}

export interface PaymentRecord {
  id: string;
  customerName: string;
  amountPaid: number;
  date: Date;
}

interface CreditState {
  accounts: CreditAccount[];
  recentPayments: PaymentRecord[];
  isLoading: boolean;
  fetchCredits: (shopId: string) => Promise<void>;
  addCustomer: (shopId: string, name: string, amount: number) => Promise<void>;
  recordPayment: (shopId: string, accountId: string, name: string, amount: number) => Promise<void>;
}

export const useCreditStore = create<CreditState>((set) => ({
  accounts: [],
  recentPayments: [],
  isLoading: false,

  fetchCredits: async (shopId) => {
    set({ isLoading: true });
    try {
      const data = await getShopCredits(shopId);
      set({ accounts: data.accounts, recentPayments: data.payments, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  addCustomer: async (shopId, name, amount) => {
    const newCustomer = await addCreditCustomerToDB(shopId, name, amount);
    set((state) => ({ accounts: [newCustomer as CreditAccount, ...state.accounts] }));
  },

  recordPayment: async (shopId, accountId, name, amount) => {
    const newPayment = await recordPaymentInDB(shopId, accountId, name, amount);
    set((state) => ({
      accounts: state.accounts.map(acc => 
        acc.id === accountId ? { ...acc, totalDue: acc.totalDue - amount, lastTransactionDate: new Date() } : acc
      ).filter(acc => acc.totalDue > 0),
      recentPayments: [newPayment as PaymentRecord, ...state.recentPayments]
    }));
  }
}));