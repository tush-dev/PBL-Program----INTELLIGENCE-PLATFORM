import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalFilters } from "@/components/layout/GlobalFilters";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PBL Program Intelligence & Grant Reporting Assistant",
  description:
    "Transform raw PBL implementation data into program intelligence, risk detection, and grant reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <GlobalFilters />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
