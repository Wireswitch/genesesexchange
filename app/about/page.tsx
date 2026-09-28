import MarketingPage from "@/components/MarketingPage";

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About"
      title="A division of Geneses Consortium"
      intro="Geneses Capital Exchange is an online capital-origination and structured-finance platform connecting credible African businesses, entrepreneurs and project developers with appropriate international sources of capital."
    >
      <div className="prose-sm space-y-6 text-foreground/70 leading-relaxed max-w-2xl">
        <p>
          Our role is to assess, prepare, structure, organize and facilitate qualified financing opportunities —
          not to promise funding, guaranteed returns or guaranteed financing. Every serious opportunity is
          reviewed by a qualified Geneses transaction professional before it reaches a capital provider.
        </p>
        <p>
          We focus initially on Uganda, Kenya, Tanzania, Rwanda, Zambia and Ghana, across energy,
          infrastructure, real estate, mining, oil &amp; gas, trade and commodities, manufacturing, healthcare,
          agriculture and logistics — expanding into further African markets as our operating model is validated.
        </p>
        <p>
          Geneses Capital Exchange sits alongside Geneses Structured Finance, Geneses Capital Intelligence and
          Geneses Private Capital within the broader Geneses Consortium — building toward a scalable,
          technology-enabled financial-services ecosystem for African capital origination.
        </p>
      </div>
    </MarketingPage>
  );
}
