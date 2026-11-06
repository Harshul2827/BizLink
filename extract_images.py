import docx
import os

doc = docx.Document('bizlink.docx')
os.makedirs('extracted_images', exist_ok=True)

for rId, rel in doc.part.rels.items():
    if 'image' in rel.target_ref:
        fname = os.path.basename(rel.target_ref)
        path = os.path.join('extracted_images', fname)
        with open(path, 'wb') as f:
            f.write(rel.target_part.blob)
        print(f"Extracted {rel.target_ref} -> {path} ({len(rel.target_part.blob):,} bytes)")

