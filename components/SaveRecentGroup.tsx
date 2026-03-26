"use client";

import { useEffect } from "react";
import { saveRecentGroup } from "@/components/CreateGroupForm";

export default function SaveRecentGroup({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  useEffect(() => {
    saveRecentGroup(id, name);
  }, [id, name]);

  return null;
}
