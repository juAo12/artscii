import { clampInt, computeTargetSize, imageDataToAscii } from "./ascii-core.js";

const els = {
  dropzone: document.getElementById("dropzone"),
  fileInput: document.getElementById("fileInput"),
  widthInput: document.getElementById("widthInput"),
  convertBtn: document.getElementById("convertBtn"),
  demoBtn: document.getElementById("demoBtn"),
  status: document.getElementById("status"),
  previewImg: document.getElementById("previewImg"),
  previewEmpty: document.getElementById("previewEmpty"),
  ascii: document.getElementById("ascii"),
  asciiEmpty: document.getElementById("asciiEmpty"),
  copyBtn: document.getElementById("copyBtn"),
  saveBtn: document.getElementById("saveBtn"),
};

let currentFile = null;
let currentObjectUrl = null;
let busy = false;

function setStatus(message, type) {
  els.status.textContent = message || "";
  els.status.className = type === "error" ? "status error" : "status";
}

function setBusy(next) {
  busy = next;
  els.convertBtn.disabled = busy || !currentFile;
  els.widthInput.disabled = busy;
}

function showPreview(objectUrl) {
  els.previewImg.src = objectUrl;
  els.previewImg.style.display = "block";
  els.previewEmpty.style.display = "none";
}

function clearPreview() {
  els.previewImg.removeAttribute("src");
  els.previewImg.style.display = "none";
  els.previewEmpty.style.display = "grid";
}

function showAscii(text) {
  els.ascii.textContent = text;
  els.asciiEmpty.style.display = text ? "none" : "grid";
  if (text) {
    els.copyBtn.classList.remove("hidden-btn");
    els.saveBtn.classList.remove("hidden-btn");
  } else {
    els.copyBtn.classList.add("hidden-btn");
    els.saveBtn.classList.add("hidden-btn");
  }
}

function isValidImageFile(file) {
  if (!file) return { ok: false, reason: "未选择文件" };
  if (!file.type || !file.type.startsWith("image/")) {
    return { ok: false, reason: "格式不支持，请选择图片文件" };
  }
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, reason: "文件过大，请选择 10MB 以内的图片" };
  }
  return { ok: true };
}

function setFile(file) {
  const v = isValidImageFile(file);
  if (!v.ok) {
    currentFile = null;
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
    clearPreview();
    showAscii("");
    els.convertBtn.disabled = true;
    setStatus(v.reason, "error");
    return;
  }

  currentFile = file;
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(file);
  showPreview(currentObjectUrl);
  setStatus("已选择图片，可点击转换", "info");
  els.convertBtn.disabled = false;
}

function loadImage(objectUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = objectUrl;
  });
}

function createCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

async function setDemoImage() {
  const w = 240;
  const h = 120;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = "#000";
  ctx.font = "bold 28px ui-monospace, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ASCII", w / 2, h / 2);
  const blob = await new Promise((r) => c.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], "demo.png", { type: "image/png" });
  setFile(file);
}

async function convertCurrent() {
  if (!currentFile || !currentObjectUrl) return;
  setBusy(true);
  setStatus("处理中…", "info");
  try {
    const width = clampInt(parseInt(els.widthInput.value, 10), 20, 200);
    els.widthInput.value = String(width);

    const img = await loadImage(currentObjectUrl);
    const { w, h } = computeTargetSize(img.width, img.height, width);
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas 初始化失败");
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const ascii = imageDataToAscii(imageData, w);
    showAscii(ascii);
    setStatus("完成", "info");
  } catch (e) {
    showAscii("");
    setStatus(e instanceof Error ? e.message : "转换失败", "error");
  } finally {
    setBusy(false);
  }
}

els.fileInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  setFile(file || null);
});

els.dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  els.dropzone.classList.add("dragover");
});

els.dropzone.addEventListener("dragleave", () => {
  els.dropzone.classList.remove("dragover");
});

els.dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  els.dropzone.classList.remove("dragover");
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  setFile(file || null);
});

els.convertBtn.addEventListener("click", () => {
  convertCurrent();
});

if (els.demoBtn) {
  els.demoBtn.addEventListener("click", async () => {
    await setDemoImage();
    convertCurrent();
  });
}

async function saveAsImage() {
  const text = els.ascii.textContent;
  if (!text) return;
  const lines = text.split("\n");
  const charWidth = 10;
  const charHeight = 18; // line-height approx
  // Use monospace font to measure
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const font = "14px ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace";
  ctx.font = font;

  // Measure widest line
  let maxW = 0;
  for (const line of lines) {
    const m = ctx.measureText(line);
    if (m.width > maxW) maxW = m.width;
  }

  const w = Math.ceil(maxW + 40); // padding
  const h = Math.ceil(lines.length * 16 + 40); // 16px line-height approx

  canvas.width = w;
  canvas.height = h;

  // Draw
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#c8ffcf"; // text color
  ctx.font = font;
  ctx.textBaseline = "top";

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 20, 20 + i * 16);
  }

  // Download
  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii-art.png";
  a.click();
  URL.revokeObjectURL(url);
}

if (els.copyBtn) {
  els.copyBtn.addEventListener("click", () => {
    const text = els.ascii.textContent;
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const originalText = els.copyBtn.textContent;
        els.copyBtn.textContent = "已复制";
        setStatus("已复制到剪贴板，请使用等宽字体查看", "info");
        setTimeout(() => {
          els.copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        setStatus("复制失败: " + err, "error");
      });
  });
}

if (els.saveBtn) {
  els.saveBtn.addEventListener("click", () => {
    saveAsImage();
  });
}

els.widthInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") convertCurrent();
});

setStatus("请选择一张图片", "info");
