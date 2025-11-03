import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'CollabDrive - Cloud & Real-Time Collaboration',
  description: 'Your next-generation cloud drive with advanced collaboration features.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 flex flex-col`}
      >
      <header className="bg-white shadow-md p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-extrabold text-blue-600">
                🚀 CollabDrive
              </h1>
              {/* UserButton will appear here once signed in */}
              <div id="user-auth-indicator"></div> 
            </div>
          </header>
          {/* Main Content Area */}
          <main className="grow max-w-7xl w-full mx-auto p-8">
            {children}
          </main>
        </body>
    </html>
    </ClerkProvider>
  );
}
