"""
build_full_bizlink_report.py
Entry-point runner for generating the complete textbook-style academic B.Tech Mini Project Report for BIZLINK.
Conforms strictly to SPIT guidelines, APNI Leap model, Times New Roman typography,
black-and-white textbook tables, clean dot-leader textbook indexes, and includes the college logo.
Outputs directly to: c:/BizLink/bizlink.docx
"""

import os
import sys

from report_generator.build_report import generate_report

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "bizlink.docx"
    generate_report(out)
