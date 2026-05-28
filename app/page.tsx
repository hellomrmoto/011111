import { PageShell } from "@/components/layout/PageShell";
import { DashboardClient } from "./DashboardClient";

export default function Home() {
  return (
    <PageShell>
      <DashboardClient />
    </PageShell>
  );
}
