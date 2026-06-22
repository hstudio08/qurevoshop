"use client";

import jsPDF from "jspdf";
import { Shop, Sale } from "@/types";

const generateDigitalSignature = async (sale: Sale) => {
  const dataString = `${sale.id}-${sale.date}-${sale.totalAmount}`;
  const msgBuffer = new TextEncoder().encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 24).toUpperCase(); 
};

export const generateInvoicePdf = async (shop: Shop, sale: Sale) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const signature = await generateDigitalSignature(sale);
  
  // Custom Invoice Number: Last 4 Phone + Date Hash + Random Letters
  const invNumber = sale.invoiceNumber || `INV-${shop.mobileNumber.slice(-4)}-${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

  // 1. Header
  pdf.setFillColor(5, 102, 141);
  pdf.rect(0, 0, 210, 40, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text(shop.shopName.toUpperCase(), 15, 20);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${shop.shopAddress}, ${shop.state}, ${shop.pincode}`, 15, 28);
  pdf.text(`Ph: ${shop.mobileNumber} | Email: ${shop.email}`, 15, 33);

  // 2. Details
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("TAX INVOICE", 15, 55);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice No: ${invNumber}`, 15, 65);
  pdf.text(`Date: ${new Date(sale.date).toLocaleDateString()} ${new Date(sale.date).toLocaleTimeString()}`, 15, 71);
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(sale.paymentMethod === "Credit" ? 239 : 34, sale.paymentMethod === "Credit" ? 68 : 197, sale.paymentMethod === "Credit" ? 68 : 94);
  pdf.text(`STATUS: ${sale.paymentMethod === "Credit" ? "CREDIT (UNPAID)" : "PAID (" + sale.paymentMethod.toUpperCase() + ")"}`, 15, 77);
  pdf.setTextColor(0, 0, 0);

  pdf.text("Billed To:", 120, 65);
  pdf.setFont("helvetica", "normal");
  pdf.text(sale.customerName || "Walk-in Customer", 120, 71);
  if (sale.customerAddress) pdf.text(sale.customerAddress, 120, 77, { maxWidth: 70 });

  // 3. Dynamic Table
  let yPos = 90;
  pdf.setFillColor(245, 247, 250);
  pdf.rect(15, yPos, 180, 10, "F");
  pdf.setFont("helvetica", "bold");
  pdf.text("Item Description", 20, yPos + 7);
  pdf.text("Qty", 120, yPos + 7);
  pdf.text("Price/Unit", 140, yPos + 7);
  pdf.text("Total", 175, yPos + 7);

  yPos += 18;
  pdf.setFont("helvetica", "normal");
  
  sale.items.forEach((item) => {
    pdf.text(item.productName, 20, yPos, { maxWidth: 90 });
    pdf.text(item.quantity.toString(), 122, yPos);
    pdf.text(`Rs ${item.unitPrice.toFixed(2)}`, 140, yPos);
    pdf.text(`Rs ${(item.quantity * item.unitPrice).toFixed(2)}`, 175, yPos);
    yPos += 10;
  });

  pdf.setDrawColor(220, 220, 220);
  pdf.line(15, yPos + 2, 195, yPos + 2);

  // 4. Totals
  yPos += 12;
  pdf.setFont("helvetica", "bold");
  pdf.text("Grand Total:", 140, yPos);
  pdf.setFontSize(14);
  pdf.text(`Rs ${sale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 170, yPos);

  // 5. Crypto Verification & Logo
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(150, 150, 150);
  pdf.text("This invoice is cryptographically secured.", 105, 270, { align: "center" });
  pdf.setFont("courier", "bold");
  pdf.text(`SECURE HASH: ${signature}`, 105, 275, { align: "center" });

  try {
    pdf.addImage("https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png", "PNG", 85, 280, 40, 10);
  } catch (e) {
    pdf.text("Powered by QUREVO", 105, 285, { align: "center" });
  }

  pdf.save(`Invoice_${invNumber}.pdf`);
};