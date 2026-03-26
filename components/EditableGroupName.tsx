"use client";

import { useState, useTransition } from "react";

export default function EditableGroupName({
  groupId,
  name,
  updateGroupAction,
}: {
  groupId: string;
  name: string;
  updateGroupAction: (groupId: string, fields: { name?: string }) => Promise<{ error?: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === name) {
      setEditing(false);
      setEditName(name);
      return;
    }
    startTransition(async () => {
      const result = await updateGroupAction(groupId, { name: trimmed });
      if (!result?.error) {
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") { setEditing(false); setEditName(name); }
          }}
          onBlur={handleSave}
          maxLength={50}
          autoFocus
          className="text-2xl font-semibold tracking-tight text-charcoal bg-input-bg rounded-lg px-2 py-0.5 border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors w-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      disabled={isPending}
      className="group flex items-center gap-1.5 text-left"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-charcoal mt-1">
        {name}
      </h1>
      <svg
        width="14"
        height="14"
        viewBox="0 0 12 12"
        fill="none"
        className="text-muted/40 group-hover:text-sage transition-colors mt-1.5"
      >
        <path
          d="M8.5 1.5l2 2M1.5 8.5l5.293-5.293a1 1 0 011.414 0l.586.586a1 1 0 010 1.414L3.5 10.5H1.5v-2z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
