"use client";

import { useTransition } from "react";
import { SimplifiedDebt } from "@/lib/types";

function DebtRow({
  debt,
  settleAction,
}: {
  debt: SimplifiedDebt;
  settleAction: (paidBy: string, paidTo: string, amount: number) => Promise<{ error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSettle() {
    startTransition(async () => {
      await settleAction(debt.from.id, debt.to.id, debt.amount);
    });
  }

  return (
    <div className={`space-y-1.5 transition-opacity ${isPending ? "opacity-40" : ""}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-coral">{debt.from.name}</span>
        <span className="text-muted">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="inline"
          >
            <path
              d="M3 8h10m0 0L9.5 4.5M13 8l-3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-medium text-sage">{debt.to.name}</span>
        <span className="ml-auto font-mono font-medium text-charcoal">
          ${debt.amount.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {debt.to.payment_handle && (
          <p className="text-xs text-muted">
            Pay via {debt.to.payment_handle}
          </p>
        )}
        <button
          onClick={handleSettle}
          disabled={isPending}
          className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-sage/30 text-sage font-medium hover:bg-sage-light transition-colors disabled:opacity-40"
        >
          {isPending ? "Saving..." : "Mark as paid"}
        </button>
      </div>
    </div>
  );
}

export default function DebtSimplification({
  debts,
  settleAction,
}: {
  debts: SimplifiedDebt[];
  settleAction: (paidBy: string, paidTo: string, amount: number) => Promise<{ error?: string }>;
}) {
  if (debts.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          To settle up
        </h2>
        <p className="text-sm text-sage font-medium">All settled up</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
        To settle up
      </h2>
      <div className="space-y-3">
        {debts.map((debt, i) => (
          <DebtRow key={i} debt={debt} settleAction={settleAction} />
        ))}
      </div>
    </div>
  );
}
