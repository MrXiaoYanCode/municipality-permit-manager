"use client";

import Link from "next/link";
import { FileCheck, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pattern px-4">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">We hit a small bump</h1>
        <p className="mb-6 text-muted-foreground">
          PermitFlow encountered a temporary issue. This is usually resolved quickly — please try again.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="rounded-xl gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" className="rounded-xl gap-2" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-6 text-xs text-muted-foreground/60 break-all">{error.message}</p>
        )}
      </div>
    </div>
  );
}
