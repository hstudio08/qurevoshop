import { db } from "./config";
import { collection, addDoc, doc, updateDoc, increment, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
//import { CreditAccount, PaymentRecord } from "@/types"; // We will define these in the store

// 1. Add a new Credit Customer (or add initial credit)
export const addCreditCustomerToDB = async (shopId: string, customerName: string, initialAmount: number) => {
  const creditsRef = collection(db, "credits");
  const newCredit = {
    shopId,
    customerName,
    totalDue: initialAmount,
    lastTransactionDate: serverTimestamp(),
  };
  const docRef = await addDoc(creditsRef, newCredit);
  return { id: docRef.id, ...newCredit, lastTransactionDate: new Date() };
};

// 2. Record a Payment
export const recordPaymentInDB = async (shopId: string, accountId: string, customerName: string, amountPaid: number) => {
  // A. Add payment to history
  const paymentsRef = collection(db, "payments");
  const newPayment = {
    shopId,
    accountId,
    customerName,
    amountPaid,
    date: serverTimestamp(),
  };
  const paymentDoc = await addDoc(paymentsRef, newPayment);

  // B. Reduce the total due in the customer's credit account
  const accountRef = doc(db, "credits", accountId);
  await updateDoc(accountRef, {
    totalDue: increment(-amountPaid),
    lastTransactionDate: serverTimestamp()
  });

  return { id: paymentDoc.id, ...newPayment, date: new Date() };
};

// 3. Fetch Accounts & Payments
export const getShopCredits = async (shopId: string) => {
  const creditsRef = collection(db, "credits");
  const qCredits = query(creditsRef, where("shopId", "==", shopId), where("totalDue", ">", 0));
  const snapCredits = await getDocs(qCredits);
  
  const accounts: any[] = [];
  snapCredits.forEach(doc => accounts.push({ id: doc.id, ...doc.data(), lastTransactionDate: doc.data().lastTransactionDate?.toDate() || new Date() }));

  const paymentsRef = collection(db, "payments");
  const qPayments = query(paymentsRef, where("shopId", "==", shopId), orderBy("date", "desc"));
  const snapPayments = await getDocs(qPayments);
  
  const payments: any[] = [];
  snapPayments.forEach(doc => payments.push({ id: doc.id, ...doc.data(), date: doc.data().date?.toDate() || new Date() }));

  return { accounts, payments };
};