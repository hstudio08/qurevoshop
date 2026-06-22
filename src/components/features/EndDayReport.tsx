"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileDown, Image as ImageIcon, CheckCircle, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";

export default function EndDayReport({ shopName, date, stats }: any) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateImage = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    const toastId = toast.loading("Generating Image...");
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `EndDay_Report_${date.replace(/ /g, "_")}.png`;
      link.click();
      toast.success("Image saved!", { id: toastId });
    } catch (error) {
      toast.error("Failed to generate image", { id: toastId });
    } finally { setIsGenerating(false); }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    const toastId = toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [1080, 1920] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 1080, 1920);
      pdf.save(`EndDay_Report_${date.replace(/ /g, "_")}.pdf`);
      toast.success("PDF saved!", { id: toastId });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: toastId });
    } finally { setIsGenerating(false); }
  };

  return (
    <>
      <button onClick={() => setShowPreview(true)} className="w-full flex items-center justify-center gap-2 bg-baltic-blue text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-rich-cerulean transition active:scale-[0.98]">
        <CheckCircle size={18} /> Today's Report
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm flex justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Report Preview</h3>
            <button onClick={() => setShowPreview(false)} className="text-white bg-white/20 rounded-full p-1"><X size={20}/></button>
          </div>
          
          {/* Scaled Preview for Mobile/Desktop screens */}
          <div className="relative w-full max-w-sm aspect-[9/16] bg-gray-50 overflow-hidden rounded-2xl shadow-2xl flex flex-col pointer-events-none">
             <div className="bg-baltic-blue text-white p-6 pb-12 rounded-b-3xl">
                <h2 className="text-xl font-black font-bebas">{shopName}</h2>
                <p className="text-xs opacity-80">{date}</p>
             </div>
             <div className="px-6 -mt-8 flex-1">
                <div className="bg-white p-4 rounded-xl shadow-md mb-3 border-l-4 border-rich-cerulean">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Total Sales</p>
                  <p className="text-2xl font-black font-ibm">₹ {stats.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md mb-3 border-l-4 border-sage-green">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Total Profit</p>
                  <p className="text-xl font-black text-sage-green font-ibm">₹ {stats.totalProfit.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                   <div className="bg-white p-3 rounded-xl shadow-sm">
                     <p className="text-[9px] text-gray-500">Cash</p>
                     <p className="font-bold text-sm">₹ {stats.cashReceived.toLocaleString()}</p>
                   </div>
                   <div className="bg-white p-3 rounded-xl shadow-sm">
                     <p className="text-[9px] text-gray-500">Online</p>
                     <p className="font-bold text-sm">₹ {stats.onlineReceived.toLocaleString()}</p>
                   </div>
                </div>
             </div>
             <div className="p-4 bg-gray-100 flex justify-center items-center gap-2 mt-auto">
                <ShieldCheck size={16} className="text-baltic-blue"/>
                <span className="text-[10px] font-bold text-gray-500">Powered by QUREVO</span>
             </div>
          </div>

          <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-6">
            <button onClick={generateImage} disabled={isGenerating} className="flex items-center justify-center gap-2 bg-white text-baltic-blue py-3 rounded-xl font-bold shadow-md hover:bg-gray-100 transition active:scale-95 disabled:opacity-70">
              <ImageIcon size={16} /> PNG Image
            </button>
            <button onClick={generatePDF} disabled={isGenerating} className="flex items-center justify-center gap-2 bg-baltic-blue text-white py-3 rounded-xl font-bold shadow-md hover:bg-rich-cerulean transition active:scale-95 disabled:opacity-70">
              <FileDown size={16} /> PDF Document
            </button>
          </div>
        </div>
      )}

      {/* Hidden high-res container for actual html2canvas capturing (1080x1920) */}
      <div className="overflow-hidden h-0 w-0 absolute left-[-9999px]">
        <div ref={reportRef} className="w-[1080px] h-[1920px] bg-gray-50 p-16 flex flex-col justify-between font-sans relative">
          <div className="absolute top-0 left-0 w-full h-[600px] bg-baltic-blue rounded-b-[100px] z-0"></div>
          <div className="relative z-10 flex justify-between items-center bg-white p-10 rounded-3xl shadow-xl mt-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-baltic-blue rounded-full text-white flex items-center justify-center text-4xl font-black font-bebas shadow-lg">Q</div>
              <div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tight font-bebas">{shopName.toUpperCase()}</h1>
                <p className="text-2xl text-gray-500 mt-2">Daily Business Summary</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-baltic-blue">{date}</p>
              <div className="flex items-center justify-end gap-2 mt-2 text-sage-green">
                <CheckCircle size={28} />
                <span className="text-2xl font-bold">Verified</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-8 mt-16 flex-1">
            <div className="bg-white p-10 rounded-3xl shadow-lg border-l-8 border-rich-cerulean flex flex-col justify-center">
              <p className="text-3xl font-bold text-gray-500 mb-4">Total Sales</p>
              <p className="text-7xl font-black text-gray-900 font-ibm">₹ {stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg border-l-8 border-sage-green flex flex-col justify-center">
              <p className="text-3xl font-bold text-gray-500 mb-4">Total Profit</p>
              <p className="text-7xl font-black text-sage-green font-ibm">₹ {stats.totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg flex flex-col justify-center">
              <p className="text-3xl font-bold text-gray-500 mb-2">Cash Received</p>
              <p className="text-5xl font-bold text-gray-900 font-ibm">₹ {stats.cashReceived.toLocaleString()}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg flex flex-col justify-center">
              <p className="text-3xl font-bold text-gray-500 mb-2">Online Received</p>
              <p className="text-5xl font-bold text-gray-900 font-ibm">₹ {stats.onlineReceived.toLocaleString()}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg flex flex-col justify-center">
              <p className="text-3xl font-bold text-gray-500 mb-2">Credit Given</p>
              <p className="text-5xl font-bold text-orange-500 font-ibm">₹ {stats.creditGiven.toLocaleString()}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg flex flex-col justify-center">
              <p className="text-3xl font-bold text-gray-500 mb-2">Transactions / Items</p>
              <p className="text-5xl font-bold text-gray-900 font-ibm">{stats.transactions} Bills / {stats.itemsSold} Items</p>
            </div>
          </div>
          <div className="relative z-10 bg-white p-10 rounded-3xl shadow-lg flex justify-between items-center mt-12 mb-8">
            <div className="flex items-center gap-4 text-baltic-blue">
              <ShieldCheck size={48} />
              <p className="text-2xl font-bold">100% Secure & Accurate</p>
            </div>
            <div className="text-right text-gray-400 text-2xl font-medium flex items-center justify-end gap-3">
              Powered by <img src="https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png" alt="Qurevo" className="h-10 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}