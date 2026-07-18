import { z } from "zod";

export const aiStructureSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1),
      features: z.array(z.string().trim().min(1)).min(1).max(12),
    })
  )
  .min(2)
  .max(12);

const featureSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().max(120),
  children: z.array(z.never()).max(0),
});

const moduleSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().max(120),
  children: z.array(featureSchema).max(20),
});

export const savedStructureSchema = z.array(moduleSchema).max(30);
