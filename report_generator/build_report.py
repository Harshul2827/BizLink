"""
build_report.py
Orchestrates the complete build process for the BizLink academic B.Tech Mini Project Report.
Invokes:
- helpers.init_document
- preliminary.build_preliminary_pages
- chapters_1_to_3.build_chapters_1_to_3
- chapters_4_to_5.build_chapters_4_to_5
- chapters_6_to_8.build_chapters_6_to_8
- chapters_9_to_11.build_chapters_9_to_11
Saves the completed document directly to c:/BizLink/bizlink.docx
"""

import os
import sys

# Ensure BizLink root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from report_generator.helpers import init_document
from report_generator.preliminary import build_preliminary_pages
from report_generator.chapters_1_to_3 import build_chapters_1_to_3
from report_generator.chapters_4_to_5 import build_chapters_4_to_5
from report_generator.chapters_6_to_8 import build_chapters_6_to_8
from report_generator.chapters_9_to_11 import build_chapters_9_to_11

def generate_report(output_path="bizlink.docx"):
    print("=" * 70)
    print("STARTING FULL BIZLINK ACADEMIC REPORT GENERATION")
    print(f"Target Output: {os.path.abspath(output_path)}")
    print("=" * 70)
    
    doc = init_document()
    
    # Preliminary Pages (1 to 10)
    build_preliminary_pages(doc)
    
    # Chapters 1 to 3
    build_chapters_1_to_3(doc)
    
    # Chapters 4 to 5
    build_chapters_4_to_5(doc)
    
    # Chapters 6 to 8 (Expanded)
    build_chapters_6_to_8(doc)
    
    # Chapters 9 to 11, References, Appendix
    build_chapters_9_to_11(doc)
    
    try:
        doc.save(output_path)
        print("=" * 70)
        print(f"SUCCESS: Report saved successfully to: {os.path.abspath(output_path)}")
        print(f"File size: {os.path.getsize(output_path):,} bytes")
        print("=" * 70)
    except PermissionError:
        alt_path = "bizlink_updated.docx"
        doc.save(alt_path)
        print("=" * 70)
        print(f"NOTICE: '{output_path}' is currently open in Microsoft Word or another program.")
        print(f"Saved complete updated report to: {os.path.abspath(alt_path)}")
        print(f"File size: {os.path.getsize(alt_path):,} bytes")
        print("Please close 'bizlink.docx' in Word to overwrite it directly.")
        print("=" * 70)

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "bizlink.docx"
    generate_report(out_file)
