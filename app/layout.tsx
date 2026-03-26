import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Splittr",
  description: "Split expenses with friends, the simple way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-surface text-charcoal font-sans">
        <div className="w-full max-w-[480px] mx-auto px-4 py-6 min-h-dvh">
          {children}
        </div>
      </body>
    </html>
  );
}
