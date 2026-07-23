import type { RequirementAnswer, TechStack } from "@/types/database";
import { TECH_CATEGORIES, CATEGORY_LABELS } from "@/lib/tech/options";
import { formatInstruction } from "./format";

export function buildProductStructurePrompt(
  idea: string,
  answers: RequirementAnswer[],
  techStack: TechStack | null,
  instruction?: string
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `Kamu adalah seorang product architect senior. Berdasarkan ide produk, jawaban requirement, dan tech stack yang dipilih, susun struktur aplikasi berupa daftar MODUL beserta FITUR di dalamnya.

Aturan penting:
- Struktur harus spesifik untuk produk ini. Marketplace, aplikasi kesehatan, dan platform edukasi punya modul yang sangat berbeda — jangan pakai kerangka generik yang sama untuk semua ide.
- Hasilkan 4 sampai 8 modul. Setiap modul berisi 2 sampai 6 fitur.
- Nama modul dan fitur ditulis dalam Bahasa Indonesia, singkat (2-4 kata), dan langsung menggambarkan fungsinya.
- Modul adalah pengelompokan besar (misal "Autentikasi", "Manajemen Pesanan"), fitur adalah kemampuan konkret di dalamnya (misal "Login dengan Google", "Lacak Status Pesanan").
- Struktur hanya DUA tingkat: modul lalu fitur. Jangan membuat sub-fitur bertingkat lagi.
- Jangan menyertakan field "id" — sistem yang akan menentukannya.

Format output WAJIB berupa JSON array murni, tanpa markdown code fence, tanpa penjelasan, persis seperti ini:
[{"name":"Autentikasi","features":["Login dengan Google","Kelola Profil"]},{"name":"Manajemen Pesanan","features":["Buat Pesanan","Lacak Status Pesanan"]}]`;

  const answersBlock =
    answers.length > 0
      ? answers
          .map((a) => `- [${a.category}] ${a.question}\n  Jawaban: ${a.answer || "(kosong)"}`)
          .join("\n")
      : "(Tidak ada jawaban klarifikasi — simpulkan langsung dari ide produk.)";

  const selectedTech = techStack
    ? TECH_CATEGORIES.map((cat) => `- ${CATEGORY_LABELS[cat]}: ${techStack[cat] ?? "(belum dipilih)"}`).join("\n")
    : "(Belum ada tech stack yang dipilih.)";

  const prompt = `Ide produk:
"""
${idea}
"""

Jawaban requirement gathering:
${answersBlock}

Tech stack yang dipilih:
${selectedTech}

Susun struktur modul dan fitur untuk produk di atas, ikuti semua aturan di system instruction.${formatInstruction(instruction)}`;

  return { prompt, systemInstruction };
}
