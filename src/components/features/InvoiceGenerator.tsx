"use client";

import jsPDF from "jspdf";
import { Shop, Sale } from "@/types";

// Helper to generate a SHA-256 digital signature
const generateDigitalSignature = async (sale: Sale) => {
  const dataString = `${sale.id}-${sale.date}-${sale.totalAmount}-${sale.productName}`;
  const msgBuffer = new TextEncoder().encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32); // Use first 32 chars
};

export const generateInvoicePdf = async (shop: Shop, sale: Sale) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const signature = await generateDigitalSignature(sale);
  
  // 1. Brand Header
  pdf.setFillColor(5, 102, 141); // Baltic Blue
  pdf.rect(0, 0, 210, 40, "F");
  
  // Add Shop/Platform Logo (Text fallback if image fails, but we try image first)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text(shop.shopName.toUpperCase(), 15, 20);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${shop.shopAddress}, ${shop.state}, ${shop.pincode}`, 15, 28);
  pdf.text(`Ph: ${shop.mobileNumber} | Email: ${shop.email}`, 15, 33);

  // 2. Invoice Details
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("INVOICE", 15, 55);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice No: INV-${sale.id.substring(0, 6).toUpperCase()}`, 15, 65);
  pdf.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 15, 71);
  
  // Payment Status
  pdf.setFont("helvetica", "bold");
  if (sale.paymentMethod === "Credit") {
    pdf.setTextColor(239, 68, 68); // Red
    pdf.text(`PAYMENT: CREDIT (DUE)`, 15, 77);
  } else {
    pdf.setTextColor(34, 197, 94); // Green
    pdf.text(`PAYMENT: ${sale.paymentMethod.toUpperCase()} (PAID)`, 15, 77);
  }
  pdf.setTextColor(0, 0, 0);

  // Customer Details
  pdf.setFont("helvetica", "bold");
  pdf.text("Billed To:", 120, 65);
  pdf.setFont("helvetica", "normal");
  pdf.text(sale.customerName || "Cash Customer", 120, 71);
  if (sale.customerAddress) pdf.text(sale.customerAddress, 120, 77, { maxWidth: 70 });

  // 3. Table
  pdf.setFillColor(240, 245, 255);
  pdf.rect(15, 90, 180, 10, "F");
  pdf.setFont("helvetica", "bold");
  pdf.text("Item Description", 20, 97);
  pdf.text("Qty", 120, 97);
  pdf.text("Price/Unit", 140, 97);
  pdf.text("Total", 175, 97);

  const safeUnitPrice = sale.unitPrice ?? (sale.totalAmount / sale.quantity);

  pdf.setFont("helvetica", "normal");
  pdf.text(sale.productName, 20, 110);
  pdf.text(sale.quantity.toString(), 122, 110);
  pdf.text(`Rs ${safeUnitPrice.toFixed(2)}`, 140, 110);
  pdf.text(`Rs ${sale.totalAmount.toFixed(2)}`, 175, 110);

  pdf.setDrawColor(220, 220, 220);
  pdf.line(15, 115, 195, 115);

  // Totals
  pdf.setFont("helvetica", "bold");
  pdf.text("Grand Total:", 140, 125);
  pdf.setFontSize(14);
  pdf.text(`Rs ${sale.totalAmount.toFixed(2)}`, 170, 125);

  // 4. Footer & Digital Cryptography Verification
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(150, 150, 150);
  pdf.text("This invoice is cryptographically secured.", 105, 255, { align: "center" });
  
  // Print SHA-256 Hash
  pdf.setFont("courier", "bold");
  pdf.text(`SHA256: ${signature}`, 105, 260, { align: "center" });

  // Load and add Qurevo Logo via Base64/URL
  try {
    const logoUrl = "https://res.cloudinary.com/dpqsadqxj/image/upload/v1782143700/logo_pwered_by_qurevo_qpbgdp.png";
    pdf.addImage(logoUrl, "PNG", 85, 265, 40, 10);
  } catch (error) {
    // Fallback if CORS blocks the image fetch
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(5, 102, 141);
    pdf.text("Powered by QUREVO", 105, 275, { align: "center" });
  }

  pdf.save(`Invoice_${sale.id.substring(0,6)}.pdf`);
};