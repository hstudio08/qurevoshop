import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppWrapper from "@/components/layout/AppWrapper";
import OfflineBanner from "@/components/layout/OfflineBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmMono = IBM_Plex_Mono({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-ibm" });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#05668d",
};

export const metadata: Metadata = {
  title: "Qurevo Shop",
  description: "Mobile-first shop management for local retailers.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmMono.variable} ${bebasNeue.variable} font-sans bg-gray-50 text-gray-900 text-sm`}>
        <OfflineBanner />
        <Toaster position="top-center" />
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}