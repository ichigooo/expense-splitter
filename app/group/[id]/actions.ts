"use server";

import { revalidatePath } from "next/cache";
import { addMember, updateMember, deleteMember, addExpense, deleteExpense, addSettlement, deleteSettlement } from "@/lib/supabase";

export async function addMemberAction(
  groupId: string,
  name: string
): Promise<{ error?: string }> {
  try {
    await addMember(groupId, name);
    revalidatePath(`/group/${groupId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to add member" };
  }
}

export async function updateMemberAction(
  groupId: string,
  memberId: string,
  fields: { name?: string; payment_handle?: string | null }
): Promise<{ error?: string }> {
  try {
    await updateMember(memberId, fields);
    revalidatePath(`/group/${groupId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update member" };
  }
}

export async function deleteMemberAction(
  groupId: string,
  memberId: string
): Promise<{ error?: string }> {
  try {
    await deleteMember(memberId);
    revalidatePath(`/group/${groupId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete member" };
  }
}

export async function addExpenseAction(data: {
  groupId: string;
  paidBy: string;
  description: string;
  amount: number;
  splitMethod: "equal" | "percentage";
  splits: { memberId: string; percentage?: number; amount: number }[];
}): Promise<{ error?: string }> {
  try {
    await addExpense(data);
    revalidatePath(`/group/${data.groupId}`);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to add expense",
    };
  }
}

export async function deleteExpenseAction(
  expenseId: string,
  groupId: string
): Promise<{ error?: string }> {
  try {
    await deleteExpense(expenseId);
    revalidatePath(`/group/${groupId}`);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to delete expense",
    };
  }
}

export async function settleDebtAction(
  groupId: string,
  paidBy: string,
  paidTo: string,
  amount: number
): Promise<{ error?: string }> {
  try {
    await addSettlement({ groupId, paidBy, paidTo, amount });
    revalidatePath(`/group/${groupId}`);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to record settlement",
    };
  }
}

export async function undoSettlementAction(
  settlementId: string,
  groupId: string
): Promise<{ error?: string }> {
  try {
    await deleteSettlement(settlementId);
    revalidatePath(`/group/${groupId}`);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to undo settlement",
    };
  }
}
