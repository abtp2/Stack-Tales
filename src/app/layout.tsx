import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";

export const metadata: Metadata = {
  title: "StackTales",
  description: "Latest Dev Blogs",
  openGraph: {
    title: "StackTales",
    description: "Latest Dev Blogs",
    url: "https://stacktales.vercel.app",
    siteName: "StackTales",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "StackTales - Latest Dev Blogs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackTales",
    description: "Latest Dev Blogs",
    images: ["/logo.jpg"],
    creator: "@yourtwitterhandle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}