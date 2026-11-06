"""
helpers.py
Core styling, XML manipulation, and formatting primitives for the BizLink textbook report.
Ensures strict Times New Roman typography, grayscale tables, paragraph-styled diagrams,
and elimination of phantom blank spacers.
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def init_document():
    doc = Document()
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return doc

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="000000", sz="4", val="single"):
    """Applies simple clean Word table grid borders matching default Word Table Grid."""
    tblPr = table._tbl.tblPr
    for child in list(tblPr):
        if child.tag.endswith('tblBorders'):
            tblPr.remove(child)
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_p(doc, text, space_before=0, space_after=6, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, bold=False, italic=False, font_size=11):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = "Times New Roman"
    run.font.size = Pt(font_size)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return p

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(9)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return p

def add_table_data(doc, headers, rows, col_widths=None):
    """B&W textbook table with repeating header row on page split and zero phantom spacers."""
    table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color="555555")
    
    # Header Row
    hdr_row = table.rows[0]
    trPr = hdr_row._tr.get_or_add_trPr()
    tblHeader = parse_xml(f'<w:tblHeader {nsdecls("w")}/>')
    trPr.append(tblHeader)
    
    for idx, text in enumerate(headers):
        cell = hdr_row.cells[idx]
        set_cell_background(cell, "FFFFFF")
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(text)
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
        
    # Data Rows
    for r_idx, r_data in enumerate(rows):
        row = table.rows[r_idx + 1]
        for c_idx, val in enumerate(r_data):
            cell = row.cells[c_idx]
            set_cell_background(cell, "FFFFFF")
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(str(val))
            run.font.name = "Times New Roman"
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
            
    if col_widths:
        for row in table.rows:
            for idx, w in enumerate(col_widths):
                row.cells[idx].width = Inches(w)
                
    return table

def add_code_block(doc, code_text, font_size=8.0):
    """
    Renders code/diagrams as styled paragraphs with subtle border & background shading.
    Eliminates monolithic 1-cell tables that cause huge blank spaces.
    """
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.1)
    p.paragraph_format.right_indent = Inches(0.1)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.0
    
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="12" w:space="8" w:color="555555"/>'
        f'<w:top w:val="single" w:sz="4" w:space="4" w:color="CCCCCC"/>'
        f'<w:right w:val="single" w:sz="4" w:space="8" w:color="CCCCCC"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="4" w:color="CCCCCC"/>'
        f'</w:pBdr>'
    )
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="FAFAFA"/>')
    pPr.append(pBdr)
    pPr.append(shd)
    
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(font_size)
    run.font.color.rgb = RGBColor(0x11, 0x11, 0x11)
    return p

def add_callout(doc, text, title="NOTE"):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.15)
    p.paragraph_format.right_indent = Inches(0.15)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="18" w:space="8" w:color="000000"/>'
        f'</w:pBdr>'
    )
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="F8F8F8"/>')
    pPr.append(pBdr)
    pPr.append(shd)
    
    run_t = p.add_run(f"[{title}] ")
    run_t.bold = True
    run_t.font.name = "Times New Roman"
    run_t.font.size = Pt(10)
    run_t.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    
    run_b = p.add_run(text)
    run_b.font.name = "Times New Roman"
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return p

def add_toc_item(doc, title, page_str, level=1, is_bold=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(1.5)
    p.paragraph_format.space_after = Pt(1.5)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.tab_stops.add_tab_stop(Inches(6.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    if level == 2:
        p.paragraph_format.left_indent = Inches(0.25)
    elif level == 3:
        p.paragraph_format.left_indent = Inches(0.45)
        
    run = p.add_run(title)
    run.bold = is_bold
    run.font.name = "Times New Roman"
    run.font.size = Pt(10.5 if level == 1 else 10)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    
    run_tab = p.add_run(f"\t{page_str}")
    run_tab.bold = is_bold
    run_tab.font.name = "Times New Roman"
    run_tab.font.size = Pt(10.5 if level == 1 else 10)
    run_tab.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

def create_screenshot_box(doc, fig_num, target_route, height_pt=140):
    """Creates an elegant fixed-height screenshot placeholder box."""
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    row = table.rows[0]
    trPr = row._tr.get_or_add_trPr()
    trHeight = parse_xml(f'<w:trHeight {nsdecls("w")} w:val="{int(height_pt * 20)}" w:hRule="atLeast"/>')
    trPr.append(trHeight)
    
    cell = row.cells[0]
    cell.width = Inches(6.5)
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="777777"/>'
        f'<w:left w:val="single" w:sz="6" w:space="0" w:color="777777"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="777777"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="777777"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    set_cell_background(cell, "FAFAFA")
    set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    r1 = p.add_run(f"[ FIGURE {fig_num}: APPLICATION SCREENSHOT PLACEHOLDER ]\n")
    r1.bold = True
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(10)
    
    r2 = p.add_run("Paste UI Screenshot Here (Aspect Ratio 16:9 / 16:10 Desktop Browser View)\n")
    r2.italic = True
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    
    r3 = p.add_run(f"Target Route / View: {target_route}")
    r3.font.name = "Consolas"
    r3.font.size = Pt(8)
    r3.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    return table

def add_screenshot_pair(doc, sub_title, intro_text, fig1_data, fig2_data):
    """
    Renders exactly two screenshot placeholders with intro, captions, descriptions,
    and a page break, ensuring 100% full-page utilization with zero blank gaps.
    """
    add_heading_2(doc, sub_title)
    add_p(doc, intro_text, space_before=2, space_after=6, line_spacing=1.15)
    
    # Figure 1
    create_screenshot_box(doc, fig1_data['num'], fig1_data['route'], height_pt=130)
    p_cap1 = doc.add_paragraph()
    p_cap1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap1.paragraph_format.space_before = Pt(3)
    p_cap1.paragraph_format.space_after = Pt(1)
    p_cap1.paragraph_format.keep_with_next = True
    r_cap1 = p_cap1.add_run(f"Figure {fig1_data['num']}: {fig1_data['title']}")
    r_cap1.bold = True
    r_cap1.font.name = "Times New Roman"
    r_cap1.font.size = Pt(10)
    
    p_desc1 = doc.add_paragraph()
    p_desc1.paragraph_format.space_before = Pt(1)
    p_desc1.paragraph_format.space_after = Pt(6)
    p_desc1.paragraph_format.line_spacing = 1.15
    r_desc1 = p_desc1.add_run(f"Technical Context: {fig1_data['desc']} ")
    r_desc1.font.name = "Times New Roman"
    r_desc1.font.size = Pt(9.5)
    r_act1 = p_desc1.add_run(f"Action for User: {fig1_data['action']}")
    r_act1.font.name = "Times New Roman"
    r_act1.font.size = Pt(9)
    r_act1.font.italic = True
    
    # Figure 2
    create_screenshot_box(doc, fig2_data['num'], fig2_data['route'], height_pt=130)
    p_cap2 = doc.add_paragraph()
    p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap2.paragraph_format.space_before = Pt(3)
    p_cap2.paragraph_format.space_after = Pt(1)
    p_cap2.paragraph_format.keep_with_next = True
    r_cap2 = p_cap2.add_run(f"Figure {fig2_data['num']}: {fig2_data['title']}")
    r_cap2.bold = True
    r_cap2.font.name = "Times New Roman"
    r_cap2.font.size = Pt(10)
    
    p_desc2 = doc.add_paragraph()
    p_desc2.paragraph_format.space_before = Pt(1)
    p_desc2.paragraph_format.space_after = Pt(6)
    p_desc2.paragraph_format.line_spacing = 1.15
    r_desc2 = p_desc2.add_run(f"Technical Context: {fig2_data['desc']} ")
    r_desc2.font.name = "Times New Roman"
    r_desc2.font.size = Pt(9.5)
    r_act2 = p_desc2.add_run(f"Action for User: {fig2_data['action']}")
    r_act2.font.name = "Times New Roman"
    r_act2.font.size = Pt(9)
    r_act2.font.italic = True
    
    doc.add_page_break()

