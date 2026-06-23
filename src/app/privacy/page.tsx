import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

export default function PrivacyPolicy() {
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
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Privacy Policy</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 pb-8 border-b border-slate-100">
            Last Updated: August 2024
          </p>

          <div className="space-y-8 text-slate-600 leading-relaxed text-sm sm:text-base">
            
            <section>
              <p>Welcome to Qurevo Shop, a service operated by Qurevo Technologies ("Qurevo", "we", "our", or "us"). This Privacy Policy explains how we collect, use, store, and protect information when you use Qurevo Shop. By using Qurevo Shop, you agree to this Privacy Policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Information We Collect</h2>
              <p className="font-bold text-slate-700 mb-2">Account Information</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Mobile number</li>
                <li>Business name</li>
                <li>Business address</li>
                <li>Profile information</li>
              </ul>
              <p className="font-bold text-slate-700 mb-2">Shop Information</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Shop name and details</li>
                <li>Product inventory and pricing</li>
                <li>Sales and Customer records</li>
                <li>Credit ledger records</li>
                <li>Invoices generated through the platform</li>
              </ul>
              <p className="font-bold text-slate-700 mb-2">Technical Information</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>IP address and Browser information</li>
                <li>Device information</li>
                <li>Usage, Error, and Security logs</li>
              </ul>
              <p className="font-bold text-slate-700 mb-2">Payment Information</p>
              <p>If paid plans are introduced, payment processing may be handled by third-party payment providers. Qurevo does not store complete payment card information.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. How We Use Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide services and maintain user accounts</li>
                <li>Generate reports and improve platform performance</li>
                <li>Detect fraud and abuse</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. Data Storage & Security</h2>
              <p className="mb-3">User data may be stored using trusted third-party providers including Firebase, Google Cloud, Vercel, Cloudflare, and other infrastructure providers. Data may be processed in countries outside the user's jurisdiction.</p>
              <p>We implement reasonable security measures to protect user data. However, no internet service can be guaranteed to be completely secure. Users acknowledge that they use the service at their own risk.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Administrator Access</h2>
              <p>To maintain platform security and legal compliance, authorized Qurevo administrators may access shop information when necessary. Examples include investigating abuse, resolving technical issues, responding to legal requests, and enforcing platform policies. We do not routinely monitor user data.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Customer Data</h2>
              <p>Shop owners are solely responsible for customer information, product information, sales records, and credit ledger records entered. Qurevo acts only as a software platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Data Retention & Third Parties</h2>
              <p className="mb-3">We may retain information while accounts remain active, for backup purposes, for fraud prevention, or to comply with legal obligations. Deleted information may remain in backups for a reasonable period.</p>
              <p>The platform may integrate with Firebase, Google Services, Vercel, Analytics providers, Payment providers, and Messaging providers. These services may have their own privacy policies.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Children's Privacy & Changes</h2>
              <p className="mb-3">Qurevo Shop is not intended for users under 18 years of age.</p>
              <p>We may update this Privacy Policy at any time. Continued use of the service constitutes acceptance of the revised policy.</p>
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