import Link from "next/link";

const features = [
  "Track every rupee with category-level intelligence",
  "Get a realistic financial health score out of 100",
  "Use rule-based AI insights without external APIs",
  "Plan savings goals and evaluate purchases with confidence",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-16 text-[#FAFAFA] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl border border-[#222222] bg-[#111111] p-10 md:p-14">
          <p className="text-sm text-[#A1A1AA]">Premium student finance platform for India</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">MoneyLens India</h1>
          <p className="mt-5 max-w-2xl text-base text-[#A1A1AA] md:text-lg">
            Manage your monthly budget, expenses, subscriptions, savings goals, and purchase
            decisions in ₹ with complete localStorage privacy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-[#FAFAFA] px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:opacity-90"
            >
              Launch Dashboard
            </Link>
            <a
              href="#features"
              className="rounded-md border border-[#222222] px-5 py-2.5 text-sm font-medium text-[#D4D4D8] transition hover:bg-[#181818]"
            >
              Explore Features
            </a>
          </div>
        </header>

        <section id="features" className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="rounded-xl border border-[#222222] bg-[#111111] p-5 text-sm text-[#D4D4D8]">
              {feature}
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Localized for India",
              body: "All finance metrics, onboarding, and reports are tuned for Indian student budgeting in ₹.",
            },
            {
              title: "AI-like Intelligence",
              body: "Rule-based advisor cards deliver practical decisions on spending, savings, and purchase timing.",
            },
            {
              title: "Built for Evaluations",
              body: "A polished fintech experience suitable for project reviews, demos, and startup-style showcases.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-[#222222] bg-[#111111] p-6">
              <h2 className="text-lg font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-[#A1A1AA]">{item.body}</p>
            </div>
          ))}
        </section>

        <footer className="mt-14 border-t border-[#222222] py-6 text-sm text-[#A1A1AA]">
          © {new Date().getFullYear()} MoneyLens India. Built for smarter student finance decisions.
        </footer>
      </div>
    </div>
  );
}
