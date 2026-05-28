import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FD Analytics — Sports Betting Dashboard",
  description: "FanDuel sports betting analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
