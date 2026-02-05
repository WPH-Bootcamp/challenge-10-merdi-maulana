import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import ConditionalHeader from "@/components/layer/ConditionalHeader";
import Footer from "@/components/layer/Footer";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlogVerse - Discover Amazing Stories",
  description:
    "A modern blog platform where you can discover amazing stories, share your thoughts, and connect with passionate writers.",
  keywords: [
    "blog",
    "articles",
    "stories",
    "writing",
    "technology",
    "programming",
  ],
  authors: [{ name: "BlogVerse Team" }],
  openGraph: {
    title: "BlogVerse - Discover Amazing Stories",
    description: "A modern blog platform for writers and readers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <ConditionalHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
