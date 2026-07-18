import { z } from "zod";

export const MAX_MODULES = 30;
export const MAX_FEATURES_PER_MODULE = 20;
export const MAX_NODE_NAME_LENGTH = 120;

export const AI_MIN_MODULES = 2;
export const AI_MAX_MODULES = 12;
export const AI_MAX_FEATURES_PER_MODULE = 12;

export const aiStructureSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1),
      features: z.array(z.string().trim().min(1)).min(1).max(AI_MAX_FEATURES_PER_MODULE),
    })
  )
  .min(AI_MIN_MODULES)
  .max(AI_MAX_MODULES);

const featureSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().max(MAX_NODE_NAME_LENGTH),
  children: z.array(z.never()).max(0),
});

const moduleSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().max(MAX_NODE_NAME_LENGTH),
  children: z.array(featureSchema).max(MAX_FEATURES_PER_MODULE),
});

export const savedStructureSchema = z.array(moduleSchema).max(MAX_MODULES);
