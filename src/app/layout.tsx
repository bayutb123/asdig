import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClassProvider } from "@/contexts/ClassContext";
import { QueryProvider } from "@/providers/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Absen Digital",
    template: "%s | Absen Digital"
  },
  description: "Sistem absensi digital untuk sekolah dan organisasi modern",
  keywords: ["absensi", "digital", "sekolah", "attendance", "management"],
  authors: [{ name: "Absen Digital Team" }],
  creator: "Absen Digital",
  publisher: "Absen Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Absen Digital",
    description: "Sistem absensi digital untuk sekolah dan organisasi modern",
    type: "website",
    locale: "id_ID",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Prevent layout shifts during initial load */
            body { min-height: 100vh; }
            .container { contain: layout; }
            /* Reduce font loading layout shifts */
            @font-face {
              font-family: 'GeistSans';
              src: url('/fonts/GeistSans-Regular.woff2') format('woff2'),
                   url('/fonts/GeistSans-Regular.woff') format('woff');
              font-display: swap;
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased stable-container`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <ClassProvider>
                <div className="stable-grid min-h-screen">
                  {children}
                </div>
              </ClassProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
