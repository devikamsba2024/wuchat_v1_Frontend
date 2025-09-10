import type { Metadata } from "next";
import { Roboto, Titillium_Web } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const titilliumWeb = Titillium_Web({
  variable: "--font-titillium",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WU Assistant - Your Virtual Guide to Wichita State University",
  description: "Get instant answers about admissions, programs, events, and campus life at Wichita State University. Your virtual assistant for all things WU.",
  keywords: ["Wichita State University", "WSU", "WU", "admissions", "academics", "campus", "assistant"],
  authors: [{ name: "WU Assistant Team" }],
  openGraph: {
    title: "WU Assistant - Your Virtual Guide to Wichita State University",
    description: "Get instant answers about admissions, programs, events, and campus life at Wichita State University.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WU Assistant - Your Virtual Guide to Wichita State University",
    description: "Get instant answers about admissions, programs, events, and campus life at Wichita State University.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${titilliumWeb.variable} antialiased`}
      >
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
