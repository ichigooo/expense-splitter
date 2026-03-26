"use client";

import { useTransition } from "react";
import { Settlement, Member } from "@/lib/types";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function SettlementRow({
  settlement,
  memberMap,
  undoAction,
}: {
  settlement: Settlement;
  memberMap: Map<string, Member>;
  undoAction: (settlementId: string) => Promise<{ error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const payer = memberMap.get(settlement.paid_by);
  const payee = memberMap.get(settlement.paid_to);

  if (!payer || !payee) return null;

  function handleUndo() {
    startTransition(async () => {
      await undoAction(settlement.id);
    });
  }

  return (
    <div
      className={`flex items-center gap-3 py-2.5 border-b border-border/60 last:border-0 transition-opacity ${
        isPending ? "opacity-40" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal">
          <span className="font-medium">{payer.name}</span>
          {" paid "}
          <span className="font-medium">{payee.name}</span>
        </p>
        <p className="text-xs text-muted mt-0.5">
          {formatDate(settlement.created_at)}
        </p>
      </div>
      <span className="text-sm font-mono font-semibold text-sage">
        ${Number(settlement.amount).toFixed(2)}
      </span>
      <button
        onClick={handleUndo}
        disabled={isPending}
        className="text-xs px-2 py-1 rounded-lg text-muted hover:text-coral hover:bg-coral-light transition-colors"
        title="Undo settlement"
      >
        Undo
      </button>
    </div>
  );
}

export default function SettlementHistory({
  settlements,
  members,
  undoSettlementAction,
}: {
  settlements: Settlement[];
  members: Member[];
  undoSettlementAction: (settlementId: string) => Promise<{ error?: string }>;
}) {
  if (settlements.length === 0) return null;

  const memberMap = new Map(members.map((m) => [m.id, m]));

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
        Payment history
      </h2>
      <div>
        {settlements.map((s) => (
          <SettlementRow
            key={s.id}
            settlement={s}
            memberMap={memberMap}
            undoAction={undoSettlementAction}
          />
        ))}
      </div>
    </div>
  );
}
