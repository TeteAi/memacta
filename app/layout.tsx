import type { Metadata } from "next";
import "./globals.css";
import NavServer from "@/components/nav-server";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "memacta",
  description: "Create stunning AI videos, images, and effects with memacta - the most powerful creative platform on the web",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <NavServer />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
