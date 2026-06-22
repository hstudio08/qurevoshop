"use client";

import { useEffect, useState } from "react";
import { Bell, User, CheckCircle, Plus, Search, Banknote, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreditStore } from "@/store/useCreditStore";
import toast from "react-hot-toast";

export default function CreditsPage() {
  const { shop } = useAuthStore();
  const { accounts, recentPayments, fetchCredits, addCustomer, recordPayment, isLoading } = useCreditStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  
  const [newCustomerName, setNewCustomerName] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shop?.id) fetchCredits(shop.id);
  }, [shop, fetchCredits]);

  const totalCreditGiven = accounts.reduce((sum, acc) => sum + acc.totalDue, 0);
  const totalReceived = recentPayments.reduce((sum, pay) => sum + pay.amountPaid, 0);
  const filteredAccounts = accounts.filter(acc => acc.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id) return;
    setIsSubmitting(true);
    try {
      await addCustomer(shop.id, newCustomerName, Number(initialAmount));
      toast.success("Credit added!");
      setIsAddModalOpen(false); setNewCustomerName(""); setInitialAmount("");
    } catch (error) { toast.error("Failed"); } finally { setIsSubmitting(false); }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id || !selectedAccount) return;
    setIsSubmitting(true);
    try {
      await recordPayment(shop.id, selectedAccount.id, selectedAccount.customerName, Number(paymentAmount));
      toast.success("Payment recorded!");
      setIsPaymentModalOpen(false); setPaymentAmount(""); setSelectedAccount(null);
    } catch (error) { toast.error("Failed"); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col min-h-screen p-3 lg:p-8 font-sans">
      <header className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 font-bebas tracking-wide">Credits Ledger</h1>
          <p className="text-[11px] lg:text-sm text-gray-500">Manage customer dues.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 bg-baltic-blue text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-rich-cerulean active:scale-95 transition">
          <Plus size={16} /> <span className="hidden sm:inline">Add Credit</span>
        </button>
      </header>

      {/* Compact Top Summary */}
      <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-4">
        <div className="bg-white rounded-xl p-3 lg:p-4 border border-orange-100 shadow-sm flex items-center gap-3">
          <div className="bg-orange-50 text-orange-500 p-2 rounded-lg"><User size={16} /></div>
          <div>
            <p className="text-[9px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pending</p>
            <p className="text-sm lg:text-xl font-black text-gray-900 font-ibm">₹{totalCreditGiven.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 lg:p-4 border border-green-100 shadow-sm flex items-center gap-3">
          <div className="bg-green-50 text-sage-green p-2 rounded-lg"><CheckCircle size={16} /></div>
          <div>
            <p className="text-[9px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Received</p>
            <p className="text-sm lg:text-xl font-black text-gray-900 font-ibm">₹{totalReceived.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
        
        {/* Credit Holders - Highly Compact on Mobile */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-2 lg:p-4 border-b border-gray-50 bg-gray-50/30 relative">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:ring-1 focus:ring-baltic-blue outline-none" />
              <Search size={14} className="absolute left-5 top-4 text-gray-400" />
            </div>

            <div className="divide-y divide-gray-50">
              {isLoading ? <div className="p-6 text-center text-xs text-gray-500">Loading ledger...</div> : 
                filteredAccounts.map((account) => (
                  <div key={account.id} className="p-3 lg:p-4 flex items-center justify-between hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-50 text-rich-cerulean flex items-center justify-center text-xs lg:text-sm font-black border border-blue-100">
                        {account.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs lg:text-sm font-bold text-gray-900 leading-tight">{account.customerName}</h4>
                        <p className="text-[9px] lg:text-[10px] text-gray-400 mt-0.5">{account.lastTransactionDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm lg:text-lg font-black text-gray-900 font-ibm">₹{account.totalDue.toLocaleString()}</p>
                        <p className="text-[8px] lg:text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Due</p>
                      </div>
                      <button onClick={() => { setSelectedAccount(account); setPaymentAmount(account.totalDue.toString()); setIsPaymentModalOpen(true); }} className="p-1.5 lg:px-3 lg:py-1.5 bg-sage-green/10 text-sage-green rounded-lg hover:bg-sage-green/20 transition flex items-center gap-1">
                        <Banknote size={14} /> <span className="hidden sm:inline text-xs font-bold">Pay</span>
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Recent Payments Sidebar */}
        <div className="hidden lg:block">
          <h3 className="text-sm font-bold text-gray-900 mb-3 font-bebas tracking-wide">Recent Payments</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {recentPayments.slice(0, 10).map((payment) => (
              <div key={payment.id} className="p-3 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{payment.customerName}</h4>
                  <p className="text-[9px] text-gray-400">{payment.date.toLocaleDateString()}</p>
                </div>
                <div className="text-xs font-black text-sage-green font-ibm">- ₹{payment.amountPaid.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Credit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-gray-900 font-bebas">Add Credit Account</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 bg-gray-100 rounded-full"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <input type="text" required value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-baltic-blue" placeholder="Customer Name" />
              </div>
              <div>
                <input type="number" required min="1" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold font-ibm outline-none focus:border-baltic-blue" placeholder="Initial Credit (₹)" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-baltic-blue text-white font-bold py-3 rounded-xl hover:bg-rich-cerulean active:scale-95 transition">
                {isSubmitting ? "Saving..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 pb-safe">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-black text-gray-900 font-bebas">Record Payment</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1.5 bg-gray-100 rounded-full"><X size={16} /></button>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl mb-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedAccount.customerName}</p>
                <p className="text-xs font-bold text-gray-900">Total Pending</p>
              </div>
              <span className="text-lg font-black text-orange-500 font-ibm">₹{selectedAccount.totalDue}</span>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <input type="number" required min="1" max={selectedAccount.totalDue} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full border-2 border-sage-green bg-green-50/30 rounded-xl p-4 text-xl font-black font-ibm text-center outline-none" placeholder="0" />
              <button type="submit" disabled={isSubmitting} className="w-full bg-sage-green text-white font-bold py-3.5 rounded-xl hover:bg-green-600 active:scale-95 transition">
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}