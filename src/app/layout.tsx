import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalFilters } from "@/components/layout/GlobalFilters";
import { Providers } from "@/components/providers";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
              <div className="sticky top-0 z-40 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <GlobalFilters />
              </div>
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
