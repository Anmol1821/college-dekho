import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext"; 
import VoiceAssistant from "@/components/VoiceAssistant";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartupLoader from "@/components/StartupLoader";
const inter = Inter({ subsets: ["latin"] });

// --- DEFINE METADATA ONCE ---
export const metadata: Metadata = {
  title: {
    default: "Govt Drish | Honest College Reviews",
    template: "%s | Govt Drish",
  },
  description:
    "The brutal truth about private colleges — honest reviews, real fees, placement risk scores and free scholarships search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StartupLoader />
        <LanguageProvider>
            <Navbar />
            {children}
            <Footer />
            <VoiceAssistant />
        </LanguageProvider>

      </body>
    </html>
  );
}
