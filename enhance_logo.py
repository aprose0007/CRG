"""
Enhance the SIMATS logo image with stronger colors and sharpness.
"""
import base64
from PIL import Image, ImageEnhance, ImageFilter

INPUT_PATH = r'd:\report auto mation\images\image_5.png'
ENHANCED_PATH = r'd:\report auto mation\images\image_5_enhanced.png'
OUTPUT_JS = r'd:\report auto mation\logo_data.js'

def enhance_logo():
    img = Image.open(INPUT_PATH).convert('RGBA')
    print(f"Original size: {img.size}, mode: {img.mode}")

    # 1. Strong color saturation boost
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.6)  # 60% more saturated

    # 2. Higher contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.35)  # 35% more contrast

    # 3. Brightness boost
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.08)

    # 4. Strong sharpening
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.5)  # 2.5x sharper

    # 5. Apply unsharp mask for extra crispness
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))

    img.save(ENHANCED_PATH, 'PNG', optimize=True)
    print(f"Enhanced image saved to: {ENHANCED_PATH}")

    with open(ENHANCED_PATH, 'rb') as f:
        data = base64.b64encode(f.read()).decode()

    with open(OUTPUT_JS, 'w', encoding='utf-8') as out:
        out.write('const SIMATS_LOGO_BASE64 = "data:image/png;base64,' + data + '";\n')

    print(f"logo_data.js regenerated. Base64 length: {len(data)}")
    print("Done!")

if __name__ == '__main__':
    enhance_logo()
