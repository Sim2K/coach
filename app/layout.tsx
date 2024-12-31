import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ActivityInitializer } from '@/components/activity-initializer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veedence",
  description: "Veedence - AI-Powered Personal Growth Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ActivityInitializer />
        <Toaster />
        {children}
      </body>
    </html>
  );
}