import { listProjects } from "@/lib/projects/actions";
import { IdeaHero } from "@/components/dashboard/IdeaHero";

export default async function DashboardPage() {
  const projects = await listProjects();

  return (
    <div className="flex flex-1 items-center justify-center">
      <IdeaHero hasPreviousProjects={projects.length > 0} />
    </div>
  );
}
