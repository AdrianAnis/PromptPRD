import type { FeatureNode, TechStack } from "@/types/database";
import { TECH_CATEGORIES, CATEGORY_LABELS } from "@/lib/tech/options";
import { formatFeatureTree } from "./format";

export function buildClassDiagramPrompt(
  prdMarkdown: string,
  structure: FeatureNode[],
  techStack: TechStack | null
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `Kamu adalah seorang software architect yang membuat Class Diagram (UML) dari sebuah Product Requirement Document.

Aturan penting:
- Keluarkan HANYA kode diagram Mermaid dengan tipe "classDiagram". Baris pertama harus persis "classDiagram".
- Jangan bungkus dengan code fence markdown. Jangan tulis penjelasan apa pun di luar kode Mermaid.
- Identifikasi entitas/kelas utama dari domain produk (contoh: User, Project, Order, Product). Ambil dari PRD dan struktur produk.
- Untuk tiap kelas, tulis atribut penting beserta tipenya dan method penting. Gunakan penanda visibilitas (+ public, - private).
- Gambarkan relasi antar kelas dengan notasi Mermaid yang benar (--> asosiasi, "1" dan "*" untuk kardinalitas, o-- agregasi, *-- komposisi) dan beri label relasi bila perlu.
- Nama kelas, atribut, dan method memakai gaya penulisan kode (PascalCase untuk kelas, camelCase untuk atribut/method). Boleh dalam Bahasa Inggris karena ini artefak teknis.
- Pastikan sintaks Mermaid valid dan bisa langsung dirender.

Contoh bentuk output (hanya gaya, sesuaikan isinya dengan produk):
classDiagram
    class User {
        +String id
        +String email
        +login()
    }
    class Project {
        +String id
        +String name
    }
    User "1" --> "*" Project : owns`;

  const structureBlock = formatFeatureTree(structure, "(Tidak ada struktur produk eksplisit.)");

  const techBlock = techStack
    ? TECH_CATEGORIES.map(
        (cat) => `- ${CATEGORY_LABELS[cat]}: ${techStack[cat] ?? "(belum dipilih)"}`
      ).join("\n")
    : "(Belum ada tech stack yang dipilih.)";

  const prompt = `Product Requirement Document:
"""
${prdMarkdown}
"""

Struktur produk (modul dan fitur):
${structureBlock}

Tech stack:
${techBlock}

Buat Class Diagram Mermaid untuk produk di atas, ikuti semua aturan di system instruction.`;

  return { prompt, systemInstruction };
}
