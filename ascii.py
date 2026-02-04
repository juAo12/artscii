import argparse
from pathlib import Path

from PIL import Image


ASCII_CHARS = "@%#*+=-:. "


def parse_args():
    parser = argparse.ArgumentParser(description="Image to ASCII")
    parser.add_argument("image", help="Path to image")
    parser.add_argument("-w", "--width", type=int, default=100)
    parser.add_argument("-o", "--output", help="Output text file")
    return parser.parse_args()


def resize_image(image, width):
    w, h = image.size
    aspect_ratio = h / w
    new_height = max(1, int(width * aspect_ratio * 0.55))
    return image.resize((width, new_height))


def pixels_to_ascii(image):
    pixels = image.getdata()
    scale = len(ASCII_CHARS) - 1
    return "".join(ASCII_CHARS[p * scale // 255] for p in pixels)


def convert(image_path, width):
    image = Image.open(image_path)
    image = image.convert("L")
    image = resize_image(image, width)
    ascii_str = pixels_to_ascii(image)
    lines = [ascii_str[i : i + image.width] for i in range(0, len(ascii_str), image.width)]
    return "\n".join(lines)


def main():
    args = parse_args()
    image_path = Path(args.image)
    if not image_path.exists():
        raise SystemExit(f"image not found: {image_path}")
    result = convert(image_path, args.width)
    if args.output:
        Path(args.output).write_text(result, encoding="utf-8")
    else:
        print(result)


if __name__ == "__main__":
    main()
