import { listProjects } from "@/lib/projects/actions";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default async function DashboardPage() {
  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Projects</h1>
        <CreateProjectModal />
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-foreground/60">
          No projects yet. Create one to turn your idea into a PRD.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
