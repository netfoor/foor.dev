import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import '@aws-amplify/ui-react/styles.css';
import { AmplifyWrapper } from "./components/AmplifyWrapper";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fortino Romero Mantilla",
  description: "Official website of Fortino Romero Mantilla",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AmplifyWrapper>
          {children}
          
        </AmplifyWrapper>
        
      </body>
    </html>
  );
}
