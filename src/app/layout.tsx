import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat Interface App",
  description: "A modern chat interface with tools and workflows",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
