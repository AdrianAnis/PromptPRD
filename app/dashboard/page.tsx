import { Suspense } from "react";
import { listProjects } from "@/lib/projects/actions";
import { IdeaHero } from "@/components/dashboard/IdeaHero";
import { WelcomeToast } from "@/components/dashboard/WelcomeToast";

export default async function DashboardPage() {
  const projects = await listProjects();

  return (
    <div className="flex flex-1 items-center justify-center">
      <Suspense>
        <WelcomeToast />
      </Suspense>
      <IdeaHero hasPreviousProjects={projects.length > 0} />
    </div>
  );
}
