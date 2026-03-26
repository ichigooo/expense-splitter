import { notFound } from "next/navigation";
import Link from "next/link";
export const dynamic = "force-dynamic";
import { getGroup, getMembers, getExpenses, getSettlements } from "@/lib/supabase";
import { calculateBalances, simplifyDebts } from "@/lib/splitCalculator";
import MemberPills from "@/components/MemberPills";
import BalanceSummary from "@/components/BalanceSummary";
import DebtSimplification from "@/components/DebtSimplification";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseModal from "@/components/AddExpenseModal";
import ShareButton from "@/components/ShareButton";
import SaveRecentGroup from "@/components/SaveRecentGroup";
import SettlementHistory from "@/components/SettlementHistory";
import EditableGroupName from "@/components/EditableGroupName";
import { EditMemberProvider } from "@/components/EditMemberContext";
import {
  updateGroupAction,
  addMemberAction,
  updateMemberAction,
  deleteMemberAction,
  addExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  settleDebtAction,
  undoSettlementAction,
} from "./actions";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const group = await getGroup(id);
  if (!group) notFound();

  const [members, expenses, settlements] = await Promise.all([
    getMembers(id),
    getExpenses(id),
    getSettlements(id),
  ]);

  const balances = calculateBalances(expenses, members, settlements);
  const debts = simplifyDebts(balances, members);

  const boundDeleteAction = async (expenseId: string) => {
    "use server";
    return deleteExpenseAction(expenseId, id);
  };

  const boundSettleAction = async (
    paidBy: string,
    paidTo: string,
    amount: number
  ) => {
    "use server";
    return settleDebtAction(id, paidBy, paidTo, amount);
  };

  const boundUndoSettlementAction = async (settlementId: string) => {
    "use server";
    return undoSettlementAction(settlementId, id);
  };

  return (
    <EditMemberProvider>
    <main className="flex flex-col gap-5 pb-8">
      <SaveRecentGroup id={id} name={group.name} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-xs text-muted hover:text-charcoal transition-colors"
          >
            &larr; Home
          </Link>
          <EditableGroupName groupId={id} name={group.name} updateGroupAction={updateGroupAction} />
        </div>
        <ShareButton />
      </div>

      {/* Members */}
      <MemberPills
        members={members}
        groupId={id}
        addMemberAction={addMemberAction}
        updateMemberAction={updateMemberAction}
        deleteMemberAction={deleteMemberAction}
      />

      {/* Add Expense */}
      <AddExpenseModal
        members={members}
        groupId={id}
        addExpenseAction={addExpenseAction}
      />

      {/* Balances */}
      <BalanceSummary balances={balances} members={members} />

      {/* Debt Simplification */}
      <DebtSimplification
        debts={debts}
        settleAction={boundSettleAction}
        groupName={group.name}
      />

      {/* Settlement History */}
      <SettlementHistory
        settlements={settlements}
        members={members}
        undoSettlementAction={boundUndoSettlementAction}
      />

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        deleteExpenseAction={boundDeleteAction}
        members={members}
        groupId={id}
        updateExpenseAction={updateExpenseAction}
      />
    </main>
    </EditMemberProvider>
  );
}
