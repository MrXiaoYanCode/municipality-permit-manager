import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — PermitFlow",
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
