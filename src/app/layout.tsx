import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AmplifyClientProvider from "../components/AmplifyClientProvider";
import { AuthProvider } from "../context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App con autenticación Amplify",
  description: "Aplicación Next.js con autenticación usando AWS Amplify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AmplifyClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </AmplifyClientProvider>
      </body>
    </html>
  );
}
