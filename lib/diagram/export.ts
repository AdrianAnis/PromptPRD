function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

function readSvgSize(svg: string): { width: number; height: number } {
  const viewBox = svg.match(/viewBox="([\d.\s-]+)"/);
  if (viewBox) {
    const parts = viewBox[1].split(/\s+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }
  const width = svg.match(/\bwidth="([\d.]+)/);
  const height = svg.match(/\bheight="([\d.]+)/);
  return {
    width: width ? Number(width[1]) : 1200,
    height: height ? Number(height[1]) : 800,
  };
}

export async function downloadPng(svg: string, filename: string, backgroundColor: string) {
  const { width, height } = readSvgSize(svg);
  const scale = 2;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.width = width;
    image.height = height;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gagal memuat diagram untuk diekspor."));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Browser tidak mendukung ekspor PNG.");

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!pngBlob) throw new Error("Gagal membuat file PNG.");

    const pngUrl = URL.createObjectURL(pngBlob);
    triggerDownload(pngUrl, filename);
    URL.revokeObjectURL(pngUrl);
  } finally {
    URL.revokeObjectURL(url);
  }
}
