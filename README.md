# ArtSCII - Browser-based Image to ASCII Converter

**ArtSCII** 是一个纯前端运行的图片转 ASCII 字符画工具。所有转换逻辑均在浏览器本地完成，无需上传服务器，安全、快速且隐私。

[在线演示 (Demo)](#) | [功能特性](#features) | [快速开始](#quick-start)

---

## 📸 效果展示 (Showcase)

![ArtSCII Interface](./screenshot.png)

> 上图展示了将一只青蛙图片转换为 ASCII 字符画的实际效果。

```text
(这里是转换后的 ASCII 文本效果，您可以直接在网页中点击“复制文本”获取)
```

## ✨ 特性 (Features)

- 🔒 **隐私安全**：图片完全在本地处理，不会上传到任何服务器。
- ⚡ **实时转换**：基于 Canvas 像素分析，毫秒级生成结果。
- 🎨 **高度定制**：支持自定义输出宽度（20-200字符）。
- 💾 **便捷导出**：
  - **复制文本**：一键复制 ASCII 文本。
  - **保存图片**：将 ASCII 文本渲染为高清 PNG 图片下载，完美解决社交软件字体对齐问题。
- 📱 **响应式设计**：黑客风格 UI，适配桌面与移动端。

## 🚀 快速开始 (Quick Start)

### 方式一：本地服务（推荐）

```bash
# 启动服务
python -m http.server 8000

# 访问
http://localhost:8000
```

### 方式二：命令行工具

```bash
pip install -r requirements.txt
python ascii.py input.jpg -w 100
```

## 📄 License

MIT License © 2024 ArtSCII
