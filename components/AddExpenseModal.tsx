"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { Member } from "@/lib/types";
import { calculateSplitAmounts } from "@/lib/splitCalculator";

export default function AddExpenseModal({
  members,
  groupId,
  addExpenseAction,
}: {
  members: Member[];
  groupId: string;
  addExpenseAction: (data: {
    groupId: string;
    paidBy: string;
    description: string;
    amount: number;
    splitMethod: "equal" | "percentage";
    splits: { memberId: string; percentage?: number; amount: number }[];
  }) => Promise<{ error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [paidBy, setPaidBy] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitMethod, setSplitMethod] = useState<"equal" | "percentage">(
    "equal"
  );
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [includedIds, setIncludedIds] = useState<Set<string>>(
    new Set(members.map((m) => m.id))
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const previousOverflow = useRef("");

  const includedMembers = members.filter((m) => includedIds.has(m.id));
  const includedMemberIds = includedMembers.map((m) => m.id);
  const parsedAmount = parseFloat(amount) || 0;

  // Initialize percentages when switching to percentage mode
  useEffect(() => {
    if (splitMethod === "percentage") {
      const equal = (100 / includedMembers.length).toFixed(2);
      const pcts: Record<string, string> = {};
      includedMembers.forEach((m) => {
        pcts[m.id] = percentages[m.id] ?? equal;
      });
      setPercentages(pcts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitMethod, includedIds]);

  const splitAmounts = calculateSplitAmounts(
    parsedAmount,
    includedMemberIds,
    splitMethod,
    splitMethod === "percentage"
      ? Object.fromEntries(
          Object.entries(percentages)
            .filter(([k]) => includedIds.has(k))
            .map(([k, v]) => [k, parseFloat(v) || 0])
        )
      : undefined
  );

  const totalPercentage = includedMemberIds.reduce(
    (sum, id) => sum + (parseFloat(percentages[id]) || 0),
    0
  );

  const isValid =
    paidBy &&
    description.trim() &&
    parsedAmount > 0 &&
    includedMembers.length >= 1 &&
    (splitMethod === "equal" ||
      (splitMethod === "percentage" &&
        Math.abs(totalPercentage - 100) < 0.01));

  const resetForm = useCallback(() => {
    setPaidBy("");
    setDescription("");
    setAmount("");
    setSplitMethod("equal");
    setPercentages({});
    setIncludedIds(new Set(members.map((m) => m.id)));
    setError("");
  }, [members]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow.current;
    }
    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [open]);

  function toggleMember(id: string) {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev; // keep at least 1
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  function handleSubmit() {
    if (!isValid) return;

    startTransition(async () => {
      const splits = includedMemberIds.map((id) => ({
        memberId: id,
        percentage:
          splitMethod === "percentage"
            ? parseFloat(percentages[id]) || 0
            : undefined,
        amount: splitAmounts[id] || 0,
      }));

      const result = await addExpenseAction({
        groupId,
        paidBy,
        description: description.trim(),
        amount: parsedAmount,
        splitMethod,
        splits,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    });
  }

  if (members.length < 2) {
    return (
      <button
        disabled
        className="w-full bg-sage/40 text-white rounded-xl px-6 py-3 font-medium cursor-not-allowed"
      >
        Add at least 2 members first
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-sage text-white rounded-xl px-6 py-3 font-medium transition-all hover:opacity-90"
      >
        Add Expense
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm animate-fade-in"
            onClick={handleClose}
          />
          <div className="relative w-full max-w-[440px] bg-card rounded-2xl shadow-lg animate-scale-in flex flex-col max-h-[min(90vh,720px)]">
            {/* Sticky header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/60 flex-shrink-0">
              <h2 className="text-lg font-semibold text-charcoal">
                Add Expense
              </h2>
              <button
                onClick={handleClose}
                className="p-2 -mr-1 rounded-xl text-muted hover:text-charcoal hover:bg-input-bg transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M4.5 4.5l9 9m0-9l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Payer */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">
                  Who paid?
                </label>
                <div className="flex gap-2 flex-wrap">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setPaidBy(member.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        paidBy === member.id
                          ? "bg-sage text-white"
                          : "bg-input-bg text-charcoal hover:bg-sage-light"
                      }`}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Dinner, groceries, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                  className="w-full bg-input-bg rounded-xl px-4 py-3 text-charcoal border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors placeholder:text-muted/60"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-input-bg rounded-xl pl-8 pr-4 py-3 text-charcoal border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors placeholder:text-muted/60 font-mono"
                  />
                </div>
              </div>

              {/* Split Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">
                  Split
                </label>
                <div className="flex bg-input-bg rounded-xl p-1">
                  <button
                    onClick={() => setSplitMethod("equal")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      splitMethod === "equal"
                        ? "bg-card text-charcoal shadow-sm"
                        : "text-muted hover:text-charcoal"
                    }`}
                  >
                    Equal
                  </button>
                  <button
                    onClick={() => setSplitMethod("percentage")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      splitMethod === "percentage"
                        ? "bg-card text-charcoal shadow-sm"
                        : "text-muted hover:text-charcoal"
                    }`}
                  >
                    Percentage
                  </button>
                </div>
              </div>

              {/* Split Breakdown */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted uppercase tracking-wider">
                  Split between
                </label>
                <div className="space-y-1.5">
                  {members.map((member) => {
                    const included = includedIds.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 text-sm rounded-lg px-2 py-1.5 transition-colors ${
                          included ? "" : "opacity-40"
                        }`}
                      >
                        <button
                          onClick={() => toggleMember(member.id)}
                          className={`w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                            included
                              ? "bg-sage border-sage text-white"
                              : "border-border bg-input-bg hover:border-sage"
                          }`}
                        >
                          {included && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2.5 6l2.5 2.5 4.5-5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <span className="w-20 truncate font-medium">
                          {member.name}
                        </span>
                        {included && splitMethod === "percentage" ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={percentages[member.id] || ""}
                              onChange={(e) =>
                                setPercentages({
                                  ...percentages,
                                  [member.id]: e.target.value,
                                })
                              }
                              className="w-20 bg-input-bg rounded-lg px-3 py-1.5 text-right border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors font-mono text-sm"
                            />
                            <span className="text-muted text-xs">%</span>
                          </div>
                        ) : (
                          <div className="flex-1" />
                        )}
                        {included ? (
                          <span className="font-mono text-muted w-20 text-right">
                            ${(splitAmounts[member.id] || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-mono text-muted/40 w-20 text-right">
                            --
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {splitMethod === "percentage" && (
                  <div className="flex items-center justify-between pt-2 px-2 border-t border-border/60">
                    <span className="text-xs text-muted">Total</span>
                    <span
                      className={`text-xs font-mono font-medium ${
                        Math.abs(totalPercentage - 100) < 0.01
                          ? "text-sage"
                          : "text-coral"
                      }`}
                    >
                      {totalPercentage.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>

              {error && <p className="text-coral text-sm">{error}</p>}
            </div>

            {/* Sticky footer */}
            <div className="px-5 pb-5 pt-3 border-t border-border/60 flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={!isValid || isPending}
                className="w-full bg-sage text-white rounded-xl px-6 py-3 font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
