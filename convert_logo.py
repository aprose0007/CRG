import base64

with open(r'd:\report auto mation\images\image_5.png', 'rb') as f:
    data = base64.b64encode(f.read()).decode()

with open(r'd:\report auto mation\logo_data.js', 'w', encoding='utf-8') as out:
    out.write('const SIMATS_LOGO_BASE64 = "data:image/png;base64,' + data + '";\n')

print("Done. Base64 length:", len(data))
