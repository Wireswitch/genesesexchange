import Link from "next/link";
import SignOutButton from "./SignOutButton";

export interface NavItem {
  href: string;
  label: string;
}

export default function PortalShell({
  title,
  userLabel,
  nav,
  children,
}: {
  title: string;
  userLabel: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 shrink-0 border-r border-line bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-line">
          <Link href="/" className="font-display text-navy font-semibold text-base">
            Geneses
          </Link>
        </div>
        <div className="px-6 pt-5 pb-2 text-[11px] uppercase tracking-wider text-foreground/40">{title}</div>
        <nav className="flex-1 px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 rounded-sm text-sm text-foreground/70 hover:bg-navy/5 hover:text-navy transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-line">
          <div className="text-xs text-foreground/50 mb-1">Signed in as</div>
          <div className="text-sm text-foreground/80 mb-3 truncate">{userLabel}</div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
