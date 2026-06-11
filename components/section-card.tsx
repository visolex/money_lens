export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#222222] bg-[#111111] p-5 transition-all hover:border-[#333333] md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#FAFAFA]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[#A1A1AA]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
