export const ASCII_CHARS = "@%#*+=-:. ";

export function clampInt(value, min, max) {
  const n = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function rgbaToLuma(r, g, b, a) {
  const alpha = a / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum * alpha + 255 * (1 - alpha);
}

export function imageDataToAscii(imageData, asciiWidth) {
  const w = imageData.width;
  const h = imageData.height;
  const data = imageData.data;
  const ramp = ASCII_CHARS;
  const scale = ramp.length - 1;
  const lines = [];
  for (let y = 0; y < h; y++) {
    let line = "";
    const rowStart = y * w * 4;
    for (let x = 0; x < w; x++) {
      const i = rowStart + x * 4;
      const luma = rgbaToLuma(data[i], data[i + 1], data[i + 2], data[i + 3]);
      const idx = Math.round((luma / 255) * scale);
      line += ramp[idx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function computeTargetSize(imgWidth, imgHeight, targetAsciiWidth) {
  const w = clampInt(targetAsciiWidth, 20, 200);
  const aspect = imgHeight / imgWidth;
  const h = Math.max(1, Math.trunc(w * aspect * 0.55));
  return { w, h };
}

