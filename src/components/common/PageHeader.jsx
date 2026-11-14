export default function PageHeader({ title, subtitle, action, className = "" }) {
  return (
    <header className={`relative z-20 flex shrink-0 items-center justify-between px-5 pt-12 pb-4 ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A855F7]" style={{ boxShadow: "0 0 5px rgba(168,85,247,0.9)" }} />
          <h1 className="truncate text-xl font-bold leading-tight text-[#E2E0F0]" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h1>
        </div>
        {subtitle && <p className="mt-1.5 text-xs leading-relaxed text-[#6B6890]" style={{ fontFamily: "'Outfit', sans-serif" }}>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
