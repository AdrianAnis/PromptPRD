export type ProjectStep =
  | "prompt"
  | "requirement"
  | "tech"
  | "structure"
  | "prd"
  | "tasks"
  | "diagram";

export type ProjectStatus = "in_progress" | "completed";

export type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export type Project = {
  id: string;
  user_id: string;
  name: string;
  idea_prompt: string | null;
  current_step: ProjectStep;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export type RequirementAnswer = {
  question: string;
  answer: string;
}

export type Requirement = {
  project_id: string;
  questions_and_answers: RequirementAnswer[];
  tech_preference: "ai" | "manual" | null;
  updated_at: string;
}

export type TechStack = {
  project_id: string;
  frontend: string | null;
  backend: string | null;
  database: string | null;
  authentication: string | null;
  storage: string | null;
  deployment: string | null;
  source: "ai" | "manual";
  updated_at: string;
}

export type FeatureNode = {
  id: string;
  name: string;
  children: FeatureNode[];
}

export type ProductStructure = {
  project_id: string;
  structure: FeatureNode[];
  version: number;
  updated_at: string;
}

export type Prd = {
  project_id: string;
  content_markdown: string;
  sections: Record<string, string>;
  version: number;
  updated_at: string;
}

export type DevTask = {
  id: string;
  title: string;
  description: string | null;
}

export type Story = {
  id: string;
  title: string;
  tasks: DevTask[];
}

export type Epic = {
  id: string;
  title: string;
  stories: Story[];
}

export type TaskList = {
  project_id: string;
  epics: Epic[];
  updated_at: string;
}

export type ClassDiagram = {
  project_id: string;
  mermaid_code: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Partial<Project> & { user_id: string; name: string };
        Update: Partial<Project>;
        Relationships: [];
      };
      requirements: {
        Row: Requirement;
        Insert: Partial<Requirement> & { project_id: string };
        Update: Partial<Requirement>;
        Relationships: [];
      };
      tech_stacks: {
        Row: TechStack;
        Insert: Partial<TechStack> & { project_id: string };
        Update: Partial<TechStack>;
        Relationships: [];
      };
      product_structures: {
        Row: ProductStructure;
        Insert: Partial<ProductStructure> & { project_id: string };
        Update: Partial<ProductStructure>;
        Relationships: [];
      };
      prds: {
        Row: Prd;
        Insert: Partial<Prd> & { project_id: string };
        Update: Partial<Prd>;
        Relationships: [];
      };
      task_lists: {
        Row: TaskList;
        Insert: Partial<TaskList> & { project_id: string };
        Update: Partial<TaskList>;
        Relationships: [];
      };
      class_diagrams: {
        Row: ClassDiagram;
        Insert: Partial<ClassDiagram> & { project_id: string };
        Update: Partial<ClassDiagram>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
