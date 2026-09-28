export default function SiteFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-3 text-sm text-foreground/60">
        <div>
          <div className="font-display text-navy text-base font-semibold mb-2">Geneses Capital Exchange</div>
          <p>A division of Geneses Consortium. Africa&apos;s digital gateway to global capital.</p>
        </div>
        <div>
          <div className="text-foreground/80 font-medium mb-2">Important information</div>
          <p>
            Geneses Capital Exchange assesses, prepares, structures, organizes and facilitates qualified financing
            opportunities. We do not promise funding, guaranteed investment returns or guaranteed financing.
            Services are subject to applicable laws, regulations and licensing requirements in each jurisdiction.
          </p>
        </div>
        <div>
          <div className="text-foreground/80 font-medium mb-2">Contact</div>
          <p>hello@geneses-capital.example</p>
          <p className="mt-4 text-xs">© {new Date().getFullYear()} Geneses Consortium. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
