"use client";

import { useTransition } from "react";
import { ExpenseWithSplits } from "@/lib/types";

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

function ExpenseRow({
  expense,
  deleteAction,
}: {
  expense: ExpenseWithSplits;
  deleteAction: (expenseId: string) => Promise<{ error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteAction(expense.id);
    });
  }

  return (
    <div
      className={`flex items-center gap-3 py-3 border-b border-border/60 last:border-0 transition-opacity ${
        isPending ? "opacity-40" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">
          {expense.description}
        </p>
        <p className="text-xs text-muted mt-0.5">
          Paid by {expense.payer.name} &middot; {formatDate(expense.created_at)}{" "}
          &middot;{" "}
          <span className="capitalize">{expense.split_method} split</span>
        </p>
      </div>
      <span className="text-sm font-mono font-semibold text-charcoal">
        ${Number(expense.amount).toFixed(2)}
      </span>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 rounded-lg text-muted hover:text-coral hover:bg-coral-light transition-colors"
        title="Delete expense"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3.5 3.5l7 7m0-7l-7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function ExpenseList({
  expenses,
  deleteExpenseAction,
}: {
  expenses: ExpenseWithSplits[];
  deleteExpenseAction: (expenseId: string) => Promise<{ error?: string }>;
}) {
  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          Expenses
        </h2>
        <p className="text-sm text-muted py-4 text-center">
          No expenses yet. Add one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
        Expenses
      </h2>
      <div>
        {expenses.map((expense) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            deleteAction={deleteExpenseAction}
          />
        ))}
      </div>
    </div>
  );
}
