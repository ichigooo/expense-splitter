import { Member } from "@/lib/types";

export default function BalanceSummary({
  balances,
  members,
}: {
  balances: Record<string, number>;
  members: Member[];
}) {
  if (members.length === 0) return null;

  const maxAbs = Math.max(
    ...members.map((m) => Math.abs(balances[m.id] || 0)),
    1
  );

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
        Balances
      </h2>
      <div className="space-y-2.5">
        {members.map((member) => {
          const balance = balances[member.id] || 0;
          const isPositive = balance > 0.01;
          const isNegative = balance < -0.01;
          const barWidth = Math.abs(balance) / maxAbs;

          return (
            <div key={member.id} className="flex items-center gap-3">
              <span className="text-sm font-medium w-20 truncate">
                {member.name}
              </span>
              <div className="flex-1 h-2 bg-input-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive
                      ? "bg-sage"
                      : isNegative
                      ? "bg-coral"
                      : "bg-muted/30"
                  }`}
                  style={{ width: `${Math.max(barWidth * 100, 2)}%` }}
                />
              </div>
              <span
                className={`text-sm font-mono font-medium w-20 text-right ${
                  isPositive
                    ? "text-sage"
                    : isNegative
                    ? "text-coral"
                    : "text-muted"
                }`}
              >
                {isPositive ? "+" : ""}
                ${Math.abs(balance).toFixed(2)}
                {isNegative && balance !== 0 ? "" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
