"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGroupAction } from "@/app/actions";

interface RecentGroup {
  id: string;
  name: string;
  visitedAt: number;
}

function getRecentGroups(): RecentGroup[] {
  try {
    const stored = localStorage.getItem("recentGroups");
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveRecentGroup(id: string, name: string) {
  try {
    const groups = getRecentGroups().filter((g) => g.id !== id);
    groups.unshift({ id, name, visitedAt: Date.now() });
    localStorage.setItem(
      "recentGroups",
      JSON.stringify(groups.slice(0, 10))
    );
  } catch {
    // localStorage unavailable
  }
}

export default function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [recentGroups, setRecentGroups] = useState<RecentGroup[]>([]);

  useEffect(() => {
    setRecentGroups(getRecentGroups());
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setError("");
    startTransition(async () => {
      const result = await createGroupAction(name.trim());
      if (result.error) {
        setError(result.error);
      } else if (result.id) {
        saveRecentGroup(result.id, name.trim());
        router.push(`/group/${result.id}`);
      }
    });
  }

  function handleGoToGroup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = link.trim();
    if (!trimmed) return;

    const match = trimmed.match(/\/group\/([a-f0-9-]+)/);
    const id = match ? match[1] : trimmed;

    if (/^[a-f0-9-]{36}$/.test(id)) {
      router.push(`/group/${id}`);
    } else {
      setError("Invalid group link or ID");
    }
  }

  function handleRemoveRecent(id: string) {
    try {
      const groups = getRecentGroups().filter((g) => g.id !== id);
      localStorage.setItem("recentGroups", JSON.stringify(groups));
      setRecentGroups(groups);
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">
          Split expenses,
          <br />
          stay friends.
        </h1>
        <p className="text-muted text-sm">
          Create a group, add members, track who owes what.
        </p>
      </div>

      <div className="w-full space-y-8">
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="w-full bg-input-bg rounded-xl px-4 py-3 text-charcoal border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors placeholder:text-muted/60"
          />
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full bg-sage text-white rounded-xl px-6 py-3 font-medium transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating..." : "Create Group"}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleGoToGroup} className="space-y-3">
          <input
            type="text"
            placeholder="Paste a group link or ID"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full bg-input-bg rounded-xl px-4 py-3 text-charcoal border border-border focus:border-sage focus:ring-1 focus:ring-sage transition-colors placeholder:text-muted/60"
          />
          <button
            type="submit"
            disabled={!link.trim()}
            className="w-full border border-sage text-sage rounded-xl px-6 py-3 font-medium transition-all hover:bg-sage-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Go to Group
          </button>
        </form>

        {error && (
          <p className="text-coral text-sm text-center">{error}</p>
        )}

        {recentGroups.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
              Recent groups
            </h2>
            <div className="space-y-1.5">
              {recentGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-2 bg-card rounded-xl px-4 py-3 border border-border hover:border-sage/40 transition-colors"
                >
                  <Link
                    href={`/group/${group.id}`}
                    className="flex-1 min-w-0 text-sm font-medium text-charcoal truncate hover:text-sage transition-colors"
                  >
                    {group.name}
                  </Link>
                  <button
                    onClick={() => handleRemoveRecent(group.id)}
                    className="p-1 rounded text-muted hover:text-coral transition-colors"
                    title="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 3l6 6m0-6l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
