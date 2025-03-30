import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blood Sugar Tracker",
  description: "NextJS web application for health tracking",
  generator: "K3nd0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
