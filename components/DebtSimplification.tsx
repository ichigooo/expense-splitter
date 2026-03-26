"use client";

import { useState, useTransition } from "react";
import { SimplifiedDebt, Member } from "@/lib/types";
import { buildVenmoUrl } from "@/lib/paymentHandles";
import { useEditMember } from "./EditMemberContext";

function DebtRow({
  debt,
  settleAction,
  groupName,
}: {
  debt: SimplifiedDebt;
  settleAction: (paidBy: string, paidTo: string, amount: number) => Promise<{ error?: string }>;
  groupName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSettle() {
    startTransition(async () => {
      await settleAction(debt.from.id, debt.to.id, debt.amount);
      setShowConfirm(false);
    });
  }

  const missingHandle = !debt.to.payment_handle;
  const isVenmo = debt.to.payment_type === "venmo" && debt.to.payment_handle;

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
        {missingHandle && (
          <span className="text-[10px] text-coral/70 bg-coral-light px-1.5 py-0.5 rounded">
            no payment info
          </span>
        )}
        <span className="ml-auto font-mono font-medium text-charcoal">
          ${debt.amount.toFixed(2)}
        </span>
      </div>

      {showConfirm ? (
        <div className="bg-sage-light/60 rounded-lg px-3 py-2.5 flex items-center gap-2">
          <p className="text-xs text-charcoal">Did you pay {debt.to.name}?</p>
          <button
            onClick={handleSettle}
            disabled={isPending}
            className="ml-auto text-xs px-3 py-1 rounded-lg bg-sage text-white font-medium hover:bg-sage/90 transition-colors disabled:opacity-40"
          >
            {isPending ? "Saving..." : "Yes, settled!"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="text-xs px-2 py-1 rounded-lg text-muted hover:text-charcoal transition-colors"
          >
            No
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {debt.to.payment_handle && (
            isVenmo ? (
              <a
                href={buildVenmoUrl(debt.to.payment_handle, debt.amount, groupName)}
                onClick={() => setShowConfirm(true)}
                rel="noopener noreferrer"
                className="text-xs text-sage underline underline-offset-2 decoration-sage/40 hover:decoration-sage transition-colors"
              >
                Pay {debt.to.payment_handle} via Venmo ↗
              </a>
            ) : (
              <p className="text-xs text-muted">
                Pay via {debt.to.payment_handle}
              </p>
            )
          )}
          <button
            onClick={handleSettle}
            disabled={isPending}
            className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-sage/30 text-sage font-medium hover:bg-sage-light transition-colors disabled:opacity-40"
          >
            {isPending ? "Saving..." : "Mark as paid"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DebtSimplification({
  debts,
  settleAction,
  groupName,
}: {
  debts: SimplifiedDebt[];
  settleAction: (paidBy: string, paidTo: string, amount: number) => Promise<{ error?: string }>;
  groupName?: string;
}) {
  const { requestEdit } = useEditMember();
  // Find unique members who are owed money but have no payment handle
  const missingHandleMembers: Member[] = [];
  const seen = new Set<string>();
  for (const debt of debts) {
    if (!debt.to.payment_handle && !seen.has(debt.to.id)) {
      seen.add(debt.to.id);
      missingHandleMembers.push(debt.to);
    }
  }

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
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
        To settle up
      </h2>

      {missingHandleMembers.length > 0 && (
        <div className="bg-coral-light/60 rounded-lg px-3 py-2.5 text-xs text-charcoal leading-relaxed">
          <p>
            {missingHandleMembers.length === 1
              ? `${missingHandleMembers[0].name} is`
              : missingHandleMembers.map((m) => m.name).join(", ") + " are"}{" "}
            owed money but {missingHandleMembers.length === 1 ? "hasn't" : "haven't"} added
            payment info.{" "}
            Tap to add:{" "}
            {missingHandleMembers.map((m, i) => (
              <span key={m.id}>
                {i > 0 && ", "}
                <button
                  onClick={() => requestEdit(m.id)}
                  className="font-semibold underline underline-offset-2 decoration-coral/40 hover:decoration-coral transition-colors"
                >
                  {m.name}
                </button>
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {debts.map((debt, i) => (
          <DebtRow key={i} debt={debt} settleAction={settleAction} groupName={groupName} />
        ))}
      </div>
    </div>
  );
}
