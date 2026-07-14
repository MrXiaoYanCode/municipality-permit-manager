import { AnimeNavBar } from "@/components/ui/anime-navbar";
import { LandingContent } from "@/components/landing/landing-content";
import { PageBackground } from "@/components/layout/page-background";

export default function HomePage() {
  return (
    <PageBackground>
      <AnimeNavBar />
      <LandingContent />
      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PermitFlow. Municipality Permit Manager.
        </div>
      </footer>
    </PageBackground>
  );
}
