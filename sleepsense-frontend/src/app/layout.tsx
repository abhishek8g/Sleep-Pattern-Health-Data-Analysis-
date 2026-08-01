import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "SleepSense AI – Sleep & Health Analytics",
    template: "%s | SleepSense AI",
  },
  description:
    "Analyze sleep patterns, predict health outcomes, and receive AI-powered recommendations with SleepSense AI.",
  keywords: ["sleep analysis", "health data", "AI predictions", "machine learning"],
  authors: [{ name: "SleepSense AI" }],
  openGraph: {
    type: "website",
    title: "SleepSense AI",
    description: "Sleep Pattern & Health Data Analysis Platform",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
