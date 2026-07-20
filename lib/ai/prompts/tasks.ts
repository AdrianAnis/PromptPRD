import type { FeatureNode } from "@/types/database";

export function buildTaskListPrompt(
  prdMarkdown: string,
  structure: FeatureNode[]
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `Kamu adalah seorang Engineering Lead yang memecah Product Requirement Document menjadi backlog pengembangan yang siap dikerjakan tim.

Aturan penting:
- Pecah pekerjaan menjadi Epic, lalu User Story di dalam tiap Epic, lalu Task teknis di dalam tiap Story.
- Epic adalah kelompok pekerjaan besar yang biasanya sejalan dengan modul produk (contoh: "Autentikasi", "Manajemen Pesanan").
- User Story ditulis dari sudut pandang pengguna atau kebutuhan bisnis (contoh: "Pengguna bisa login dengan Google").
- Task adalah langkah implementasi teknis yang konkret dan bisa dikerjakan developer (contoh: "Buat tabel users di database", "Integrasi Supabase Auth provider Google").
- Turunkan Epic dan Story dari bagian Kebutuhan Fungsional pada PRD dan dari struktur modul/fitur yang diberikan. Jangan mengarang fitur yang tidak ada di PRD.
- Hasilkan 3 sampai 10 Epic. Tiap Epic 1 sampai 6 Story. Tiap Story 2 sampai 8 Task.
- Semua judul dan deskripsi dalam Bahasa Indonesia. Judul singkat; deskripsi task 1-2 kalimat yang menjelaskan apa yang harus dikerjakan.

Format output WAJIB berupa JSON array murni, tanpa markdown code fence, tanpa penjelasan, persis seperti ini:
[{"title":"Autentikasi","stories":[{"title":"Pengguna bisa login dengan Google","tasks":[{"title":"Integrasi Supabase Auth provider Google","description":"Aktifkan provider Google di Supabase dan simpan kredensial OAuth."}]}]}]`;

  const structureBlock =
    structure.length > 0
      ? structure
          .map((mod) => {
            const features = mod.children.map((f) => `  - ${f.name}`).join("\n");
            return features ? `- ${mod.name}\n${features}` : `- ${mod.name}`;
          })
          .join("\n")
      : "(Tidak ada struktur produk eksplisit.)";

  const prompt = `Product Requirement Document:
"""
${prdMarkdown}
"""

Struktur produk (modul dan fitur):
${structureBlock}

Pecah PRD di atas menjadi backlog Epic, User Story, dan Task, ikuti semua aturan di system instruction.`;

  return { prompt, systemInstruction };
}
