import type { Metadata } from "next";
import { Playfair_Display, Inter, Changa } from "next/font/google";
import PolicyConsentModalLoader from "@/app/components/PolicyConsentModalLoader";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mind Rain - Architecture Design Competitions",
  description: "Architecture design competitions and events hosting organization",
};

const changa = Changa({
  variable: "--font-changa",
  subsets: ["latin"],
  weight: ["200", "300", "500"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${changa.variable} antialiased`}>
        {children}
        <PolicyConsentModalLoader />
      </body>
    </html>
  );
}
