import { auth } from "../auth";
import AppShell from "./app-shell";

export default async function AppShellServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <AppShell session={session}>{children}</AppShell>;
}
