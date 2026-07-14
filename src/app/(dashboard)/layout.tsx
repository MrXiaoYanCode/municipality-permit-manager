import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { PageBackground } from "@/components/layout/page-background";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageBackground>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="container mx-auto p-6 pt-16 lg:pt-6">{children}</div>
        </main>
      </div>
    </PageBackground>
  );
}
