import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100dvh-48px)] flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-charcoal">Group not found</h1>
      <p className="text-sm text-muted">
        This group doesn&apos;t exist or the link is incorrect.
      </p>
      <Link
        href="/"
        className="text-sm text-sage hover:underline font-medium"
      >
        Go home
      </Link>
    </main>
  );
}
