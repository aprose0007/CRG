"""Compare generated report with reference template."""
from docx import Document

def align_name(a):
    m = {0:'LEFT',1:'CENTER',2:'RIGHT',3:'JUSTIFIED',4:'DISTRIBUTE'}
    return m.get(a, str(a)) if a is not None else 'INHERITED'

def analyze(path, label, max_para=50):
    lines = []
    lines.append(f"\n{'='*70}")
    lines.append(f"  {label}")
    lines.append(f"{'='*70}")
    try:
        doc = Document(path)
    except Exception as e:
        lines.append(f"  ERROR loading: {e}")
        return '\n'.join(lines)
    
    for i, sec in enumerate(doc.sections):
        lines.append(f"\n--- Section {i+1} ---")
        lines.append(f"  Margins L/R/T/B: {sec.left_margin/914400:.2f}/{sec.right_margin/914400:.2f}/{sec.top_margin/914400:.2f}/{sec.bottom_margin/914400:.2f}")
    
    for i, p in enumerate(doc.paragraphs[:max_para]):
        text = p.text.strip()
        if not text: continue
        pf = p.paragraph_format
        lines.append(f"\n[P{i}] Align={align_name(pf.alignment)}")
        lines.append(f"  '{text[:90]}'")
        for j, r in enumerate(p.runs[:3]):
            if not r.text.strip(): continue
            d = []
            if r.font.name: d.append(f"'{r.font.name}'")
            if r.font.size: d.append(f"{r.font.size.pt}pt")
            if r.font.bold: d.append("BOLD")
            if r.font.italic: d.append("ITALIC")
            lines.append(f"  R{j}: [{','.join(d)}]")
    return '\n'.join(lines)

# Try all generated files
import os
dl = r"C:\Users\Aprose\Downloads"
files = [f for f in os.listdir(dl) if f.endswith('.docx') and 'Full_Report' in f]
files.sort(key=lambda x: os.path.getmtime(os.path.join(dl, x)), reverse=True)

out = "=== COMPARISON ===\n"
if files:
    latest = os.path.join(dl, files[0])
    out += f"\nLatest file: {files[0]}\n"
    out += analyze(latest, "GENERATED (latest)")
else:
    out += "\nNo generated files found"

out += "\n\n\n"
out += analyze(r"d:\report auto mation\Front pages - Capstone Project.docx.docx", "REFERENCE TEMPLATE")

with open(r"d:\report auto mation\compare_output.txt", 'w', encoding='utf-8') as f:
    f.write(out)
print("Done")
