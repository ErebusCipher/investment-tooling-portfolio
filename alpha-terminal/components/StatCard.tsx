interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  sub?: string;
}

export default function StatCard({ label, value, delta, deltaPositive, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <p className="text-xs font-mono text-zinc-500 mb-1">{label}</p>
      <p className="text-xl font-mono font-bold text-zinc-100">{value}</p>
      {delta && (
        <p className={`text-xs font-mono mt-1 ${deltaPositive ? "text-green-400" : "text-red-400"}`}>
          {delta}
        </p>
      )}
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}
