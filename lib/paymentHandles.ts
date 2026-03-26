export function buildVenmoUrl(handle: string, amount: number, groupName?: string): string {
  const username = handle.trim().replace(/^@/, "");
  const note = groupName ? `Splittr: ${groupName}` : "Splittr settlement";
  return `https://venmo.com/${username}?txn=pay&amount=${amount.toFixed(2)}&note=${encodeURIComponent(note)}`;
}
