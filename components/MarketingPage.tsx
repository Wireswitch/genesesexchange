import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/ui";

export default function MarketingPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-navy mb-6 max-w-2xl">{title}</h1>
        {intro && <p className="text-foreground/65 text-lg leading-relaxed max-w-2xl mb-10">{intro}</p>}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
