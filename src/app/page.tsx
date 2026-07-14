import { Navbar } from "@/components/layout/navbar";
import { LandingContent } from "@/components/landing/landing-content";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <LandingContent />
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PermitFlow. Municipality Permit Manager.
        </div>
      </footer>
    </div>
  );
}
