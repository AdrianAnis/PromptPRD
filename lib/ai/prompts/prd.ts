import type { FeatureNode, RequirementAnswer, TechStack } from "@/types/database";
import { TECH_CATEGORIES, CATEGORY_LABELS } from "@/lib/tech/options";
import { REQUIRED_SECTION_HEADINGS } from "@/lib/prd/schema";

export function buildPrdPrompt(
  idea: string,
  answers: RequirementAnswer[],
  techStack: TechStack | null,
  structure: FeatureNode[]
): { prompt: string; systemInstruction: string } {
  const skeleton = REQUIRED_SECTION_HEADINGS.map((heading) => `## ${heading}`).join("\n\n");

  const systemInstruction = `Kamu adalah seorang Product Manager senior yang menulis Product Requirement Document (PRD) sungguhan untuk tim desain dan tim pengembang.

Aturan penting:
- Tulis seluruh dokumen dalam Bahasa Indonesia dan dalam format Markdown.
- Dokumen WAJIB memakai persis delapan heading berikut, dengan urutan dan penulisan yang sama:

${skeleton}

- Jangan menambah, mengurangi, mengganti, atau menerjemahkan heading di atas. Kamu boleh menambahkan sub-heading (###) di dalam tiap bagian.
- Bagian "Kebutuhan Fungsional" harus diturunkan dari struktur modul dan fitur yang diberikan, bukan dikarang ulang. Tulis sebagai daftar bernomor dengan kode (contoh: FR-001) dan satu kalimat penjelas per kebutuhan.
- Bagian "Kebutuhan Non-Fungsional" harus mempertimbangkan tech stack yang dipilih (performa, keamanan, skalabilitas, kompatibilitas).
- Bagian "User Stories" ditulis dengan format "Sebagai [peran], saya ingin [kebutuhan], supaya [manfaat]".
- Bagian "Metrik Keberhasilan" harus terukur (angka, persentase, atau satuan waktu).
- Isi tiap bagian dengan substansi nyata dari konteks yang diberikan, bukan kalimat placeholder.
- JANGAN membungkus seluruh dokumen dalam code fence. Keluarkan Markdown mentah langsung.`;

  const answersBlock =
    answers.length > 0
      ? answers
          .map((a) => `- [${a.category}] ${a.question}\n  Jawaban: ${a.answer || "(kosong)"}`)
          .join("\n")
      : "(Tidak ada jawaban klarifikasi.)";

  const techBlock = techStack
    ? TECH_CATEGORIES.map(
        (cat) => `- ${CATEGORY_LABELS[cat]}: ${techStack[cat] ?? "(belum dipilih)"}`
      ).join("\n")
    : "(Belum ada tech stack yang dipilih.)";

  const structureBlock =
    structure.length > 0
      ? structure
          .map((mod) => {
            const features = mod.children.map((f) => `  - ${f.name}`).join("\n");
            return features ? `- ${mod.name}\n${features}` : `- ${mod.name}`;
          })
          .join("\n")
      : "(Belum ada struktur produk. Turunkan kebutuhan fungsional langsung dari ide dan jawaban requirement.)";

  const prompt = `Ide produk:
"""
${idea}
"""

Jawaban requirement gathering:
${answersBlock}

Tech stack yang dipilih:
${techBlock}

Struktur produk (modul dan fitur):
${structureBlock}

Tulis PRD lengkap untuk produk di atas, ikuti semua aturan di system instruction.`;

  return { prompt, systemInstruction };
}
