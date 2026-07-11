import { listProjects } from "@/lib/projects/actions";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Riwayat Project</h1>

      {projects.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Belum ada project. Buat satu dari halaman utama untuk mengubah idemu jadi PRD.
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
