interface OpenRoleCardProps {
  title: string;
  location: string;
  type: string;
  description: string;
  subject: string;
}

export default function OpenRoleCard({
  title,
  location,
  type,
  description,
  subject,
}: OpenRoleCardProps) {
  const mailtoHref = `mailto:careers@memacta.ai?subject=${encodeURIComponent(subject)}`;
  return (
    <div
      data-testid="open-role-card"
      className="rounded-xl bg-[#181828] border border-white/15 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-white/50 mt-0.5">
            {location} &middot; {type}
          </p>
          <p className="text-sm text-white/70 mt-3 leading-relaxed">{description}</p>
        </div>
        <a
          href={mailtoHref}
          className="glow-btn shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-semibold whitespace-nowrap self-start"
        >
          Apply via email &rarr;
        </a>
      </div>
    </div>
  );
}
