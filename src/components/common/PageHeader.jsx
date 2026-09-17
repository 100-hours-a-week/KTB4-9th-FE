export default function PageHeader({ eyebrow, title, subtitle, action, className = "" }) {
  return (
    <header className={`relative z-20 flex shrink-0 items-center justify-between px-5 pt-12 pb-4 ${className}`}>
      <div>
        {eyebrow && <div className="mb-1.5 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#A855F7]" style={{ boxShadow: "0 0 5px rgba(168,85,247,0.9)" }} /><span className="text-[10px] font-semibold uppercase tracking-widest text-[#4A4870]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{eyebrow}</span></div>}
        <h1 className="text-xl font-bold leading-tight text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h1>
        {subtitle && <p className="mt-1.5 text-xs leading-relaxed text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
