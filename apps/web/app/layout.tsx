import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import GradientCanvas from "../components/GradientCanvas";
import Providers from "./providers";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "PredictX",
  description: "Real-time predictions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white dark:bg-black text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Header />
          <GradientCanvas />
          <main className="flex-1 min-h-screen bg-white dark:bg-black">
            {children}
          </main>
          <Footer />
          <Providers />
        </ThemeProvider>
      </body>
    </html>
  );
}
