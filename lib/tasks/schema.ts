import { z } from "zod";

export const MAX_EPICS = 12;
export const MAX_STORIES_PER_EPIC = 12;
export const MAX_TASKS_PER_STORY = 15;
export const MAX_TITLE_LENGTH = 160;
export const MAX_DESCRIPTION_LENGTH = 500;

export const aiTaskListSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
      stories: z
        .array(
          z.object({
            title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
            tasks: z
              .array(
                z.object({
                  title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
                  description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).default(""),
                })
              )
              .min(1)
              .max(MAX_TASKS_PER_STORY),
          })
        )
        .min(1)
        .max(MAX_STORIES_PER_EPIC),
    })
  )
  .min(1)
  .max(MAX_EPICS);
