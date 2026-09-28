import PortalShell from "@/components/PortalShell";
import { auth } from "@/auth";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/providers", label: "Capital providers" },
  { href: "/admin/matches", label: "Match review queue" },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <PortalShell title="Admin" userLabel={session?.user?.name ?? session?.user?.email ?? ""} nav={NAV}>
      {children}
    </PortalShell>
  );
}
