import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Group,
  Member,
  Expense,
  ExpenseWithSplits,
  Settlement,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: SupabaseClient<any, any, any> | null = null;

function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your Supabase credentials."
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export async function createGroup(name: string): Promise<Group> {
  const { data, error } = await getSupabase()
    .from("groups")
    .insert({ name })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Group;
}

export async function getGroup(id: string): Promise<Group | null> {
  const { data, error } = await getSupabase()
    .from("groups")
    .select()
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Group;
}

export async function addMember(
  groupId: string,
  name: string
): Promise<Member> {
  const { data, error } = await getSupabase()
    .from("members")
    .insert({ group_id: groupId, name })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A member with this name already exists in the group");
    }
    throw new Error(error.message);
  }
  return data as Member;
}

export async function getMembers(groupId: string): Promise<Member[]> {
  const { data, error } = await getSupabase()
    .from("members")
    .select()
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Member[];
}

export async function updateMember(
  memberId: string,
  fields: { name?: string; payment_handle?: string | null }
): Promise<void> {
  const { error } = await getSupabase()
    .from("members")
    .update(fields)
    .eq("id", memberId);

  if (error) {
    if (error.code === "23505") {
      throw new Error("A member with this name already exists in the group");
    }
    throw new Error(error.message);
  }
}

export async function deleteMember(memberId: string): Promise<void> {
  // Check if member has any expenses (as payer or in splits)
  const { count: payerCount } = await getSupabase()
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("paid_by", memberId);

  if (payerCount && payerCount > 0) {
    throw new Error("Cannot delete a member who has paid for expenses. Delete their expenses first.");
  }

  const { count: splitCount } = await getSupabase()
    .from("expense_splits")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId);

  if (splitCount && splitCount > 0) {
    throw new Error("Cannot delete a member included in expense splits. Delete those expenses first.");
  }

  const { error } = await getSupabase()
    .from("members")
    .delete()
    .eq("id", memberId);

  if (error) throw new Error(error.message);
}

export async function addExpense(input: {
  groupId: string;
  paidBy: string;
  description: string;
  amount: number;
  splitMethod: "equal" | "percentage";
  splits: { memberId: string; percentage?: number; amount: number }[];
}): Promise<Expense> {
  const { data: expense, error: expenseError } = await getSupabase()
    .from("expenses")
    .insert({
      group_id: input.groupId,
      paid_by: input.paidBy,
      description: input.description,
      amount: input.amount,
      split_method: input.splitMethod,
    })
    .select()
    .single();

  if (expenseError) throw new Error(expenseError.message);

  const splitRows = input.splits.map((s) => ({
    expense_id: expense.id,
    member_id: s.memberId,
    percentage: s.percentage ?? null,
    amount: s.amount,
  }));

  const { error: splitsError } = await getSupabase()
    .from("expense_splits")
    .insert(splitRows);

  if (splitsError) throw new Error(splitsError.message);

  return expense as Expense;
}

export async function getExpenses(
  groupId: string
): Promise<ExpenseWithSplits[]> {
  const { data, error } = await getSupabase()
    .from("expenses")
    .select(
      "*, payer:members!paid_by(*), expense_splits(*, member:members!member_id(*))"
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as ExpenseWithSplits[];
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function getSettlements(groupId: string): Promise<Settlement[]> {
  const { data, error } = await getSupabase()
    .from("settlements")
    .select()
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Settlement[];
}

export async function addSettlement(input: {
  groupId: string;
  paidBy: string;
  paidTo: string;
  amount: number;
}): Promise<Settlement> {
  const { data, error } = await getSupabase()
    .from("settlements")
    .insert({
      group_id: input.groupId,
      paid_by: input.paidBy,
      paid_to: input.paidTo,
      amount: input.amount,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Settlement;
}

export async function deleteSettlement(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("settlements")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
