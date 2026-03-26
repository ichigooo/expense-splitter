import { ExpenseWithSplits, Member, Settlement, SimplifiedDebt } from "./types";

export function calculateBalances(
  expenses: ExpenseWithSplits[],
  members: Member[],
  settlements: Settlement[] = []
): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const member of members) {
    balances[member.id] = 0;
  }

  for (const expense of expenses) {
    // Payer gets credited the full amount
    balances[expense.paid_by] =
      (balances[expense.paid_by] || 0) + Number(expense.amount);

    // Each split member gets debited their share
    for (const split of expense.expense_splits) {
      balances[split.member_id] =
        (balances[split.member_id] || 0) - Number(split.amount);
    }
  }

  // Settlements reduce debts: payer's balance goes up, payee's goes down
  for (const s of settlements) {
    balances[s.paid_by] = (balances[s.paid_by] || 0) + Number(s.amount);
    balances[s.paid_to] = (balances[s.paid_to] || 0) - Number(s.amount);
  }

  // Round all balances to 2 decimal places
  for (const id in balances) {
    balances[id] = Math.round(balances[id] * 100) / 100;
  }

  return balances;
}

export function simplifyDebts(
  balances: Record<string, number>,
  members: Member[]
): SimplifiedDebt[] {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const transactions: SimplifiedDebt[] = [];

  // Separate into creditors and debtors
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, balance] of Object.entries(balances)) {
    if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ id, amount: Math.abs(balance) });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const settlement = Math.min(debtors[i].amount, creditors[j].amount);
    const roundedSettlement = Math.round(settlement * 100) / 100;

    if (roundedSettlement > 0) {
      const fromMember = memberMap.get(debtors[i].id);
      const toMember = memberMap.get(creditors[j].id);

      if (fromMember && toMember) {
        transactions.push({
          from: fromMember,
          to: toMember,
          amount: roundedSettlement,
        });
      }
    }

    debtors[i].amount -= settlement;
    creditors[j].amount -= settlement;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return transactions;
}

export function calculateSplitAmounts(
  totalAmount: number,
  memberIds: string[],
  splitMethod: "equal" | "percentage",
  percentages?: Record<string, number>
): Record<string, number> {
  const amounts: Record<string, number> = {};

  if (splitMethod === "equal") {
    const baseAmount = Math.floor((totalAmount / memberIds.length) * 100) / 100;
    const remainder =
      Math.round((totalAmount - baseAmount * memberIds.length) * 100) / 100;

    memberIds.forEach((id, index) => {
      amounts[id] = index === 0 ? baseAmount + remainder : baseAmount;
    });
  } else if (splitMethod === "percentage" && percentages) {
    for (const id of memberIds) {
      const pct = percentages[id] || 0;
      amounts[id] = Math.round(((totalAmount * pct) / 100) * 100) / 100;
    }
  }

  return amounts;
}
