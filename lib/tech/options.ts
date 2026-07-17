export const TECH_CATEGORIES = [
  "frontend",
  "backend",
  "database",
  "authentication",
  "storage",
  "deployment",
] as const;

export type TechCategory = (typeof TECH_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<TechCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  authentication: "Authentication",
  storage: "Storage",
  deployment: "Deployment",
};

// Single source of truth for the dropdown UI, the AI prompt's allowed values,
// and the coerce-to-null validator. Keep label === value, no version suffixes,
// consistent casing.
export const TECH_OPTIONS: Record<TechCategory, string[]> = {
  frontend: [
    "Next.js",
    "React",
    "Vue.js",
    "Angular",
    "SvelteKit",
    "React Native",
    "Flutter",
    "HTML/CSS/JS",
  ],
  backend: [
    "Next.js API Routes",
    "Node.js (Express)",
    "NestJS",
    "Python (FastAPI)",
    "Python (Django)",
    "Laravel (PHP)",
    "Go",
    "Ruby on Rails",
  ],
  database: [
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "SQLite",
    "Supabase (PostgreSQL)",
    "Firebase Firestore",
  ],
  authentication: [
    "Supabase Auth",
    "Firebase Auth",
    "Auth0",
    "Clerk",
    "NextAuth.js",
    "JWT (custom)",
    "Tidak perlu",
  ],
  storage: [
    "Supabase Storage",
    "AWS S3",
    "Cloudinary",
    "Firebase Storage",
    "Local Filesystem",
    "Tidak perlu",
  ],
  deployment: [
    "Vercel",
    "Netlify",
    "AWS",
    "Google Cloud",
    "Railway",
    "Render",
    "VPS (Docker)",
  ],
};
