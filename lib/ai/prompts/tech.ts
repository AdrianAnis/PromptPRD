import type { RequirementAnswer } from "@/types/database";
import { TECH_CATEGORIES, CATEGORY_LABELS, type TechCategory } from "@/lib/tech/options";

export function buildTechRecommendationPrompt(
  idea: string,
  answers: RequirementAnswer[],
  options: Record<TechCategory, string[]>
): { prompt: string; systemInstruction: string } {
  const allowedLists = TECH_CATEGORIES.map(
    (cat) => `${CATEGORY_LABELS[cat]} (key "${cat}"): ${options[cat].join(", ")}`
  ).join("\n");

  const systemInstruction = `Kamu adalah seorang software architect senior. Berdasarkan ide produk dan jawaban requirement, rekomendasikan satu tech stack yang modern, pragmatis, dan realistis untuk dibangun.

Aturan penting:
- Untuk SETIAP kategori, pilih TEPAT SATU nilai, dan nilai itu HARUS persis salah satu dari daftar yang diizinkan di bawah (tulis sama persis, termasuk huruf besar/kecil dan tanda baca).
- Pilih kombinasi yang saling cocok dan sesuai skala/jenis produk. Kalau sebuah kategori tidak dibutuhkan produk ini (misal storage untuk aplikasi tanpa upload file), pilih opsi "Tidak perlu" jika tersedia.
- Jangan mengarang nilai di luar daftar. Jangan tambahkan versi atau keterangan.

Daftar nilai yang diizinkan per kategori:
${allowedLists}

Format output WAJIB berupa JSON objek murni, tanpa markdown code fence, tanpa penjelasan, persis dengan 6 key ini:
{"frontend": "...", "backend": "...", "database": "...", "authentication": "...", "storage": "...", "deployment": "..."}`;

  const answersBlock =
    answers.length > 0
      ? answers.map((a) => `- [${a.category}] ${a.question}\n  Jawaban: ${a.answer || "(kosong)"}`).join("\n")
      : "(Tidak ada jawaban klarifikasi — simpulkan kebutuhan teknologi langsung dari ide produk.)";

  const prompt = `Ide produk:
"""
${idea}
"""

Jawaban requirement gathering:
${answersBlock}

Rekomendasikan tech stack untuk produk di atas, ikuti semua aturan di system instruction.`;

  return { prompt, systemInstruction };
}
