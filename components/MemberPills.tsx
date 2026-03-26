"use client";

import { useState, useTransition } from "react";
import { Member } from "@/lib/types";

export default function MemberPills({
  members,
  groupId,
  addMemberAction,
  updateMemberAction,
  deleteMemberAction,
}: {
  members: Member[];
  groupId: string;
  addMemberAction: (groupId: string, name: string) => Promise<{ error?: string }>;
  updateMemberAction: (groupId: string, memberId: string, fields: { name?: string; payment_handle?: string | null }) => Promise<{ error?: string }>;
  deleteMemberAction: (groupId: string, memberId: string) => Promise<{ error?: string }>;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const membersWithoutHandle = members.filter((m) => !m.payment_handle);

  function handleAdd() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await addMemberAction(groupId, name.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setName("");
        setAdding(false);
        setError("");
      }
    });
  }

  function startEditing(member: Member) {
    setEditingId(member.id);
    setEditName(member.name);
    setEditHandle(member.payment_handle || "");
    setError("");
  }

  function handleSave() {
    if (!editingId || !editName.trim()) return;
    const member = members.find((m) => m.id === editingId);
    if (!member) return;

    const nameChanged = editName.trim() !== member.name;
    const handleChanged = (editHandle.trim() || null) !== (member.payment_handle || null);

    if (!nameChanged && !handleChanged) {
      setEditingId(null);
      return;
    }

    const fields: { name?: string; payment_handle?: string | null } = {};
    if (nameChanged) fields.name = editName.trim();
    if (handleChanged) fields.payment_handle = editHandle.trim() || null;

    startTransition(async () => {
      const result = await updateMemberAction(groupId, editingId, fields);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditingId(null);
        setError("");
      }
    });
  }

  function handleDelete(memberId: string) {
    startTransition(async () => {
      const result = await deleteMemberAction(groupId, memberId);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditingId(null);
        setError("");
      }
    });
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        {members.map((member) =>
          editingId === member.id ? (
            <div key={member.id} className="w-full bg-card rounded-xl p-3 border border-sage/30 space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") { setEditingId(null); setError(""); }
                  }}
                  placeholder="Name"
                  maxLength={30}
                  autoFocus
                  className="flex-1 bg-input-bg rounded-lg px-3 py-1.5 text-sm border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors"
                />
                <button
                  onClick={handleSave}
                  disabled={isPending || !editName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-sage text-white text-xs font-medium disabled:opacity-40 transition-opacity"
                >
                  {isPending ? "..." : "Save"}
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-muted hover:text-coral hover:bg-coral-light transition-colors"
                  title="Delete member"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 3l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => { setEditingId(null); setError(""); }}
                  className="px-2 py-1.5 rounded-lg text-muted text-xs hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={editHandle}
                onChange={(e) => setEditHandle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") { setEditingId(null); setError(""); }
                }}
                placeholder="Venmo or Zelle handle, e.g. @john-doe"
                maxLength={50}
                className="w-full bg-input-bg rounded-lg px-3 py-1.5 text-sm border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors placeholder:text-muted/50"
              />
            </div>
          ) : (
            <button
              key={member.id}
              onClick={() => startEditing(member)}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-light text-charcoal text-sm font-medium hover:bg-sage/20 transition-colors"
            >
              {member.name}
              {member.payment_handle ? (
                <span className="text-muted text-xs font-normal">
                  {member.payment_handle}
                </span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-muted/50 group-hover:text-sage transition-colors"
                >
                  <path
                    d="M8.5 1.5l2 2M1.5 8.5l5.293-5.293a1 1 0 011.414 0l.586.586a1 1 0 010 1.414L3.5 10.5H1.5v-2z"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )
        )}

        {adding ? (
          <div className="inline-flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setName(""); setError(""); }
              }}
              maxLength={30}
              autoFocus
              className="w-24 bg-input-bg rounded-full px-3 py-1.5 text-sm border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={isPending || !name.trim()}
              className="px-3 py-1.5 rounded-full bg-sage text-white text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              {isPending ? "..." : "Add"}
            </button>
            <button
              onClick={() => { setAdding(false); setName(""); setError(""); }}
              className="px-2 py-1.5 rounded-full text-muted text-sm hover:text-charcoal transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setAdding(true); setEditingId(null); }}
            className="inline-flex items-center px-3 py-1.5 rounded-full border border-dashed border-muted/40 text-muted text-sm hover:border-sage hover:text-sage transition-colors"
          >
            + Add member
          </button>
        )}
      </div>

      {/* Payment handle prompt */}
      {members.length > 0 && membersWithoutHandle.length > 0 && !editingId && (
        <button
          onClick={() => startEditing(membersWithoutHandle[0])}
          className="flex items-center gap-2 text-xs text-muted hover:text-sage transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
            <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <span>
            Add Venmo/Zelle handles to show in settle up
            {membersWithoutHandle.length < members.length && (
              <> &middot; {membersWithoutHandle.length} remaining</>
            )}
          </span>
        </button>
      )}

      {error && <p className="text-coral text-xs">{error}</p>}
    </div>
  );
}
