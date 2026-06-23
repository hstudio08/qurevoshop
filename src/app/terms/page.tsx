import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Store size={20} className="text-indigo-600" />
            <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">QUREVO SHOP</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 mt-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Terms and Conditions</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 pb-8 border-b border-slate-100">
            Last Updated: August 2024
          </p>

          <div className="space-y-8 text-slate-600 leading-relaxed text-sm sm:text-base">
            
            <section>
              <p>These Terms govern the use of Qurevo Shop. By using the platform, you agree to these Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Service Description & Platform Role</h2>
              <p className="mb-3">Qurevo Shop provides software tools for shop management, inventory management, customer credit tracking, sales tracking, reporting, and invoice generation.</p>
              <p className="mb-3">Qurevo does not operate, manage, or participate in users' businesses.</p>
              <p className="font-bold text-indigo-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                Qurevo Shop is a software platform only. Qurevo does not become a party to any transaction between shop owners and their customers, and assumes no responsibility for products, services, payments, debts, invoices, or disputes arising from such transactions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. User Responsibilities & Prohibited Activities</h2>
              <p className="mb-2">Users are solely responsible for information entered, products listed, prices entered, sales records, customer records, and compliance with local laws.</p>
              <p className="mb-2">Users may not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sell illegal goods or conduct fraudulent activities</li>
                <li>Upload harmful content or attempt unauthorized access</li>
                <li>Distribute malware or violate applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. No Verification of Products</h2>
              <p>Qurevo does not verify product legality, product quality, or product authenticity. Responsibility remains entirely with the shop owner.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Suspension and Termination</h2>
              <p>Qurevo may suspend or terminate accounts at any time if laws are violated, abuse is detected, security risks exist, or platform integrity is threatened. Suspension may occur without prior notice.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Limitation of Liability</h2>
              <p className="mb-2">To the maximum extent permitted by law, Qurevo Technologies, its owners, employees, contractors, affiliates, and developers shall not be liable for:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Business losses or lost profits</li>
                <li>Lost data or Customer disputes</li>
                <li>Tax issues or Inventory inaccuracies</li>
                <li>Credit ledger errors or Billing errors</li>
                <li>Service interruptions</li>
              </ul>
              <p>Use of the platform is at the user's own risk.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Service Availability & Backups</h2>
              <p className="mb-3">We do not guarantee continuous uptime, error-free operation, or uninterrupted service. Maintenance, outages, and technical issues may occur.</p>
              <p>Users are responsible for maintaining their own backups of important business information. While we may perform backups, recovery is not guaranteed.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Intellectual Property</h2>
              <p className="mb-2">All platform code, branding, design, content, trademarks, and software remain the exclusive property of Qurevo Technologies. Users may not copy, reverse engineer, resell, or redistribute any part of the platform without permission.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Indemnification & Governing Law</h2>
              <p className="mb-3">Users agree to defend and hold harmless Qurevo Technologies, its owners, developers, contractors, and affiliates from any claims arising from user activities, products sold, customer disputes, or violations of law.</p>
              <p>These Terms shall be governed by the laws applicable in the jurisdiction where Qurevo Technologies operates.</p>
            </section>

            <section className="pt-8 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Contact Us</h2>
              <p><strong>Qurevo Technologies</strong><br/>
              Website: <a href="https://qurevo.in" className="text-indigo-600 hover:underline">qurevo.in</a><br/>
              Email: qurevotechnologies@gmail.com</p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}