import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import ReduxProvider from "@/redux/provider/ReduxProvider";
import { Navbar } from "@/components/shared/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Subnix — Project Submission & Review Dashboard",
  description:
    "A clean full-stack project submission portal for students and review dashboard for mentors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        <ReduxProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
