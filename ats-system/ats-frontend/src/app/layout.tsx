import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Velocity - Modern ATS",
  description: "Advanced Applicant Tracking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
