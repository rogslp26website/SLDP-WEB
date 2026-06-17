import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import MainWithOffset from "@/components/MainWithOffset";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "RoG Student Leadership Development Programme",
  description: "RoG Student Leadership Development Programme - Developing the next generation of leaders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <Navbar />
          <MainWithOffset>{children}</MainWithOffset>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}