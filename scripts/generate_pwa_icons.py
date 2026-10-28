import os
from PIL import Image, ImageDraw, ImageFont

def generate_png_icon(size, filename, is_maskable=False):
    # Create high-res image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background color: #5a1818
    bg_color = (90, 24, 24, 255)
    border_color = (230, 186, 126, 120)
    
    if is_maskable:
        # Full bleed rectangle without rounded corners for maskable
        draw.rectangle([0, 0, size, size], fill=bg_color)
        padding = int(size * 0.12)
    else:
        # Rounded rectangle
        corner_radius = int(size * 0.22)
        draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=bg_color)
        padding = int(size * 0.05)
    
    # Gold border
    margin = int(size * 0.04)
    draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=int(size * 0.18), outline=border_color, width=max(2, int(size * 0.015)))

    # Flower symbol center
    cx, cy = size // 2, int(size * 0.42)
    radius = int(size * 0.18)
    
    # Draw petals
    gold_color = (245, 158, 11, 255)
    amber_color = (251, 191, 36, 255)
    
    for angle in range(0, 360, 45):
        import math
        rad = math.radians(angle)
        px = cx + int(radius * math.cos(rad))
        py = cy + int(radius * math.sin(rad))
        p_radius = int(size * 0.06)
        draw.ellipse([px - p_radius, py - p_radius, px + p_radius, py + p_radius], fill=gold_color if angle % 90 == 0 else amber_color)
    
    # Center circle
    c_radius = int(size * 0.07)
    draw.ellipse([cx - c_radius, cy - c_radius, cx + c_radius, cy + c_radius], fill=(255, 255, 255, 255))
    inner_r = int(size * 0.045)
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=bg_color)

    # Text label "COMAIIT"
    try:
        font_size = max(12, int(size * 0.11))
        # Default fallback font
        font = ImageFont.load_default()
    except Exception:
        font = None

    text = "COMAIIT"
    if font:
        # Draw stylized text
        draw.text((cx, int(size * 0.74)), text, fill=(255, 255, 255, 255), anchor="mm", font=font)
        draw.text((cx, int(size * 0.86)), "POS", fill=(230, 186, 126, 255), anchor="mm", font=font)

    os.makedirs('public', exist_ok=True)
    out_path = os.path.join('public', filename)
    img.save(out_path, 'PNG')
    print(f"Generated {out_path} ({size}x{size})")

if __name__ == '__main__':
    generate_png_icon(192, 'pwa-192x192.png', is_maskable=False)
    generate_png_icon(512, 'pwa-512x512.png', is_maskable=False)
    generate_png_icon(512, 'pwa-maskable-512x512.png', is_maskable=True)
    generate_png_icon(180, 'apple-touch-icon.png', is_maskable=False)
