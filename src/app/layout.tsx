import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "BetweenUs",
  description: "Những gì chỉ có giữa chúng mình.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
