import Link from "next/link";
import { auth } from "@/auth";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/seek-capital", label: "Seek Capital" },
  { href: "/capital-providers", label: "Capital Providers" },
  { href: "/services", label: "Services" },
  { href: "/sectors", label: "Sectors" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export default async function SiteHeader() {
  const session = await auth();
  const portalHref =
    session?.user.role === "ADMIN"
      ? "/admin/dashboard"
      : session?.user.role === "CAPITAL_PROVIDER"
      ? "/capital-provider/dashboard"
      : session?.user
      ? "/project-owner/dashboard"
      : null;

  return (
    <header className="border-b border-line bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-navy tracking-tight">Geneses</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-gold">Capital Exchange</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-foreground/70 hover:text-navy transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {portalHref ? (
            <Link
              href={portalHref}
              className="text-sm font-medium px-4 py-2 rounded-sm bg-navy text-white hover:bg-navy-light transition-colors"
            >
              My dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-foreground/70 hover:text-navy transition-colors">
                Log in
              </Link>
              <Link
                href="/seek-capital"
                className="text-sm font-medium px-4 py-2 rounded-sm bg-navy text-white hover:bg-navy-light transition-colors"
              >
                Start assessment
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
