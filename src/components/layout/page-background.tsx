export function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-pattern">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-black/40" />
      <div className="relative">{children}</div>
    </div>
  );
}
