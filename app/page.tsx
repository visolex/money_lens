import Link from "next/link";

const features = [
  "Expense tracking with category insights",
  "Financial health score based on spending behavior",
  "Rule-based AI recommendations for better saving",
  "Savings goals and smart purchase decision advisor",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-16 text-[#FAFAFA] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl border border-[#222222] bg-[#111111] p-10 md:p-14">
          <p className="text-sm text-[#A1A1AA]">Smart Money Management System for Students</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">MoneyLens</h1>
          <p className="mt-5 max-w-2xl text-base text-[#A1A1AA] md:text-lg">
            Track expenses, analyze spending habits, improve savings, and make smarter financial
            decisions.
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
            { title: "Benefits", body: "Develop healthier spending habits and improve long-term financial confidence." },
            { title: "How It Works", body: "Store your data locally, visualize trends, and get smart recommendations instantly." },
            { title: "Built for Students", body: "Designed around student budgets, recurring costs, and practical savings goals." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-[#222222] bg-[#111111] p-6">
              <h2 className="text-lg font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-[#A1A1AA]">{item.body}</p>
            </div>
          ))}
        </section>

        <footer className="mt-14 border-t border-[#222222] py-6 text-sm text-[#A1A1AA]">
          © {new Date().getFullYear()} MoneyLens. Built for smarter student finance decisions.
        </footer>
      </div>
    </div>
  );
}
