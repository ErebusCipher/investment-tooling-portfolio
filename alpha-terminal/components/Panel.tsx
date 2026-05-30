interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/30 ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-mono font-semibold text-zinc-300">{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
