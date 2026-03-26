export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export interface Member {
  id: string;
  group_id: string;
  name: string;
  payment_handle: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  group_id: string;
  paid_by: string;
  description: string;
  amount: number;
  split_method: "equal" | "percentage";
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  percentage: number | null;
  amount: number;
}

export interface ExpenseWithSplits extends Expense {
  payer: Member;
  expense_splits: (ExpenseSplit & { member: Member })[];
}

export interface Settlement {
  id: string;
  group_id: string;
  paid_by: string;
  paid_to: string;
  amount: number;
  created_at: string;
}

export interface SimplifiedDebt {
  from: Member;
  to: Member;
  amount: number;
}
