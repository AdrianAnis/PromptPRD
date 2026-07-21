import type { Epic } from "@/types/database";

export function countTasks(epics: Epic[]): number {
  return epics.reduce(
    (sum, epic) => sum + epic.stories.reduce((inner, story) => inner + story.tasks.length, 0),
    0
  );
}

export function taskListToMarkdown(projectName: string, epics: Epic[]): string {
  const lines: string[] = [`# ${projectName} — Development Tasks`, ""];

  lines.push(`${epics.length} Epic · ${countTasks(epics)} task`, "");

  epics.forEach((epic, epicIndex) => {
    lines.push(`## ${epicIndex + 1}. ${epic.title}`, "");

    epic.stories.forEach((story, storyIndex) => {
      lines.push(`### ${epicIndex + 1}.${storyIndex + 1} ${story.title}`, "");

      story.tasks.forEach((task) => {
        lines.push(`- [ ] ${task.title}`);
        if (task.description) lines.push(`      ${task.description}`);
      });

      lines.push("");
    });
  });

  return lines.join("\n").trimEnd() + "\n";
}
