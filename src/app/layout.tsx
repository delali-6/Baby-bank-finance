
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1f4d3a",
};

export const metadata: Metadata = {
  title: {
    default: "Baby Bank Finance",
    template: "%s | Baby Bank Finance",
  },
  description: "Financial records for our baby bank charity.",
  applicationName: "Baby Bank Finance",
  appleWebApp: {
    capable: true,
    title: "Baby Bank",
    statusBarStyle: "default",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body>
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
