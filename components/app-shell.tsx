"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import Nav from "@/components/nav";
import Sidebar from "@/components/sidebar";
import ClaimPending from "@/components/create/claim-pending";

export default function AppShell({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider session={session}>
      <ClaimPending />
      <Nav
        session={session}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex-1 flex flex-col transition-all duration-300">
        {children}
      </div>
    </SessionProvider>
  );
}
