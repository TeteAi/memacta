"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import Nav from "@/components/nav";
import Sidebar from "@/components/sidebar";

export default function AppShell({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Nav
        session={session}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex-1 flex flex-col transition-all duration-300">
        {children}
      </div>
    </>
  );
}
