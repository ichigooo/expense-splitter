"use server";

import { createGroup } from "@/lib/supabase";

export async function createGroupAction(
  name: string
): Promise<{ id?: string; error?: string }> {
  try {
    const group = await createGroup(name);
    return { id: group.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create group" };
  }
}
