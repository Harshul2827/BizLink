"""
preliminary.py
Generates the complete preliminary matter (Pages 1 to 10) for the BizLink report.
Features:
- Title page with centered official SPIT college logo and candidate credentials
- Formal Certificate of Approval with 4 examiner signature blocks
- Declaration with academic integrity pledge
- Acknowledgement to guides, department, and institution
- Comprehensive Abstract with IEEE Index Terms
- Compact 4-column List of Abbreviations fitting 100% on Page 6
- 2-page Textbook Table of Contents with dot leaders (Pages 7-8)
- 2-page List of Figures and Tables (Pages 9-10)
"""

import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from .helpers import (
    add_p, add_heading_1, add_heading_2, add_table_data, add_toc_item
)

def build_preliminary_pages(doc):
    print("Building Title Page (Page 1)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGE 1: TITLE PAGE
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "A MINI PROJECT REPORT ON", space_before=12, space_after=8, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=12)
    add_p(doc, "BIZLINK: A STRUCTURED B2B BUSINESS DISCOVERY AND COLLABORATION PLATFORM WITH EXPLAINABLE MULTI-CRITERIA MATCHING AND POWER BI ANALYTICS", space_before=8, space_after=16, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=13.5)
    
    # College Logo
    logo_path = os.path.abspath("college_logo.jpg")
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(6)
        p_logo.paragraph_format.space_after = Pt(14)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(1.8))
        print("  Inserted college logo into Page 1.")
    else:
        print("  Warning: college_logo.jpg not found on disk!")

    add_p(doc, "SUBMITTED IN PARTIAL FULFILMENT OF THE REQUIREMENTS\nFOR THE DEGREE OF\nBACHELOR OF TECHNOLOGY IN COMPUTER ENGINEERING\n(Academic Year 2026–27)", space_before=8, space_after=16, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10.5)
    
    add_p(doc, "BY", space_before=4, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=11)
    add_p(doc, "Rushil Patadia (UID: 2024300161)\nHarshul Shah (UID: 2024300225)\nAryan Shah (UID: 2024300223)", space_before=4, space_after=16, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=11)
    
    add_p(doc, "UNDER THE GUIDANCE OF\nProject Guide\nDepartment of Computer Engineering", space_before=8, space_after=16, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10.5)
    
    add_p(doc, "DEPARTMENT OF COMPUTER ENGINEERING\nSARDAR PATEL INSTITUTE OF TECHNOLOGY (SPIT)\n(Autonomous Institute Affiliated to University of Mumbai)\nMunshi Nagar, Andheri (West), Mumbai – 400058\nACADEMIC YEAR: 2026–27", space_before=12, space_after=8, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10.5)
    
    doc.add_page_break()

    print("Building Certificate of Approval (Page 2)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGE 2: CERTIFICATE OF APPROVAL
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "CERTIFICATE OF APPROVAL", space_before=36, space_after=20, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    add_p(
        doc,
        'This is to certify that the Mini Project entitled "BizLink: A Structured B2B Business Discovery and Collaboration '
        'Platform with Explainable Multi-Criteria Matching and Power BI Analytics" is a bona fide record of authentic '
        'engineering work carried out by:\n\n'
        '1. Rushil Patadia (UID: 2024300161)\n'
        '2. Harshul Shah (UID: 2024300225)\n'
        '3. Aryan Shah (UID: 2024300223)\n\n'
        'in partial fulfilment of the requirements for the award of the Degree of Bachelor of Technology in Computer Engineering '
        '(Third Year, Semester V/VI) during the academic year 2026–27 at Sardar Patel Institute of Technology, Mumbai.',
        space_before=16, space_after=48, line_spacing=1.35, font_size=11
    )
    
    sig_table = doc.add_table(rows=3, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r in sig_table.rows:
        r.cells[0].width = Inches(3.25)
        r.cells[1].width = Inches(3.25)
    
    p_sig1 = sig_table.rows[0].cells[0].paragraphs[0]
    p_sig1.add_run("______________________________\nDr. / Prof. Project Guide\nProject Guide\nDepartment of Computer Engineering\nS.P.I.T., Mumbai").bold = True
    p_sig1.runs[0].font.name = "Times New Roman"
    
    p_sig2 = sig_table.rows[0].cells[1].paragraphs[0]
    p_sig2.add_run("______________________________\nDr. / Prof. Head of Department\nDepartment of Computer Engineering\nS.P.I.T., Mumbai").bold = True
    p_sig2.runs[0].font.name = "Times New Roman"
    
    p_sig3 = sig_table.rows[2].cells[0].paragraphs[0]
    p_sig3.add_run("______________________________\nInternal Examiner\n\nDate:").bold = True
    p_sig3.runs[0].font.name = "Times New Roman"
    
    p_sig4 = sig_table.rows[2].cells[1].paragraphs[0]
    p_sig4.add_run("______________________________\nExternal Examiner\n\nDate:").bold = True
    p_sig4.runs[0].font.name = "Times New Roman"
    
    doc.add_page_break()

    print("Building Declaration (Page 3)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGE 3: DECLARATION
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "DECLARATION", space_before=36, space_after=20, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    add_p(
        doc,
        "We declare that this report is our own work and is written in our own words. Wherever we have used ideas, papers, "
        "software libraries, architectural patterns, mathematical formulas, or algorithmic specifications from others, we have "
        "duly cited the original academic and industry sources.",
        space_before=14, space_after=14, line_spacing=1.25, font_size=11
    )
    add_p(
        doc,
        "We confirm that the report adheres strictly to the APNI Leap model prescribed by Sardar Patel Institute of Technology. "
        "It preserves a clear and rigorous distinction between the planned design specifications, the actual software code "
        "implemented across our database, backend, and frontend tracks, and the measured empirical evaluation results.",
        space_before=8, space_after=14, line_spacing=1.25, font_size=11
    )
    add_p(
        doc,
        "We also confirm that the performance metrics, automated test case results, database constraints, and execution logs "
        "presented in this document are authentic, verifiable, and truthful. Where an endpoint was simulated, a test executed in "
        "a specific staging environment, or an architectural feature planned for future scope, the report explicitly states so. "
        "Our engineering team maintains its own collaborative Git repository containing the complete source code, migration scripts, "
        "test suites, and documentation.",
        space_before=8, space_after=28, line_spacing=1.25, font_size=11
    )
    add_p(doc, "Date: 04 November 2026\nPlace: Mumbai", space_before=14, space_after=28, line_spacing=1.25, bold=True)
    add_p(
        doc,
        "1. Rushil Patadia (UID: 2024300161)\n"
        "2. Harshul Shah (UID: 2024300225)\n"
        "3. Aryan Shah (UID: 2024300223)",
        space_before=8, space_after=12, bold=True, line_spacing=1.35
    )
    
    doc.add_page_break()

    print("Building Acknowledgement (Page 4)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGE 4: ACKNOWLEDGEMENT
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "ACKNOWLEDGEMENT", space_before=36, space_after=20, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    add_p(
        doc,
        "We would like to express our deep sense of gratitude to our Project Guide, Department of Computer Engineering, "
        "for invaluable guidance, continuous encouragement, and constructive technical critique throughout the design, implementation, "
        "and testing of BizLink. The consistent insistence on verifiable proof of correctness, robust system architecture, and "
        "academic integrity has profoundly influenced the engineering rigor of this project.",
        space_before=14, space_after=14, line_spacing=1.25, font_size=11
    )
    add_p(
        doc,
        "We are immensely thankful to the Head of the Department of Computer Engineering and to the administration of Sardar Patel "
        "Institute of Technology for providing state-of-the-art laboratory infrastructure, computational resources, and a stimulating "
        "academic environment conducive to high-quality project development.",
        space_before=8, space_after=14, line_spacing=1.25, font_size=11
    )
    add_p(
        doc,
        "We also convey our sincere thanks to the project coordinators, laboratory instructors, and faculty panel members who reviewed "
        "our progressive milestones during the academic reviews, offering insightful suggestions on database normalization, API security, "
        "and user experience design. Finally, we express our heartfelt appreciation to our parents, family members, and peers whose "
        "patience, understanding, and unwavering support sustained our efforts across all development phases.",
        space_before=8, space_after=28, line_spacing=1.25, font_size=11
    )
    add_p(
        doc,
        "Rushil Patadia (UID: 2024300161)\n"
        "Harshul Shah (UID: 2024300225)\n"
        "Aryan Shah (UID: 2024300223)\n"
        "(Department of Computer Engineering, Sardar Patel Institute of Technology)",
        space_before=14, space_after=12, bold=True, line_spacing=1.35
    )
    
    doc.add_page_break()

    print("Building Abstract (Page 5)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGE 5: ABSTRACT
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "ABSTRACT", space_before=24, space_after=12, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    add_p(
        doc,
        "Index Terms— B2B Discovery, Rule-Based Matching Engine, Collaboration Lifecycle, OLTP Schema, Star Schema, "
        "Slowly Changing Dimensions (SCD Type 2), Power BI Analytics, Role-Based Access Control, Web Application.",
        space_before=4, space_after=14, bold=True, italic=True, font_size=10
    )
    add_p(
        doc,
        "Small and medium enterprises (SMEs) predominantly depend on informal personal contacts, word-of-mouth recommendations, "
        "and geographically confined referral networks to procure services, source suppliers, and identify collaborative partners. "
        "This traditional networking paradigm severely constrains business discovery, introduces high friction, and creates information "
        "asymmetry. Existing B2B directories function primarily as passive advertisement boards or lead-generation tools laden with spam, "
        "while professional social networks prioritize individual career resumes rather than structured organizational capabilities.",
        space_before=6, space_after=10, line_spacing=1.2, font_size=11
    )
    add_p(
        doc,
        "BizLink resolves these structural inefficiencies by establishing a comprehensive, full-stack B2B business discovery and "
        "collaboration platform. BizLink provides structured organizational profiles that explicitly separate commercial offerings "
        "(services) and procurement requirements (needs). The platform features an explainable, multi-criteria rule-based matching "
        "engine that computes quantified compatibility scores across taxonomic category hierarchy (35%), budget-price interval overlap "
        "(25%), geographic alignment (20%), and verified trust ratings (20%). It facilitates verifiable peer-to-peer relationships "
        "through stateful connection handshakes, in-app business messaging, an 8-state collaborative project lifecycle tracker, and "
        "post-collaboration verified 5-star reviews.",
        space_before=6, space_after=10, line_spacing=1.2, font_size=11
    )
    add_p(
        doc,
        "The system architecture is engineered as a decoupled three-tier enterprise web application comprising a modern React 18, "
        "Vite 5, and Tailwind CSS single-page application (SPA); a resilient Node.js and Express.js REST API layer enforcing JWT "
        "authentication, Role-Based Access Control (RBAC), and strict input sanitization; and a dual-purpose relational MySQL 8 database. "
        "The persistence layer features an operational OLTP schema of 16 normalized tables alongside a dedicated 5-table analytics star "
        "schema implementing Slowly Changing Dimensions (SCD Type 2) on user and enterprise dimensions to preserve historical state transitions. "
        "Curated reporting views directly power an executive Power BI dashboard modeled on Apple Analytics design principles, delivering "
        "real-time commercial intelligence over procurement pipelines, liquidity, and partner trust.",
        space_before=6, space_after=10, line_spacing=1.2, font_size=11
    )
    add_p(
        doc,
        "The project was executed through a strict gated governance methodology across database, backend, and frontend layers. This report "
        "documents the theoretical foundation, mathematical matching formulation, comprehensive UML architectural blueprints, implementation "
        "artifacts, automated test suites (50+ assertions across constraint, API, and integration tiers), empirical performance evaluations, "
        "identified defects, and future roadmaps.",
        space_before=6, space_after=12, line_spacing=1.2, font_size=11
    )

    doc.add_page_break()

    print("Building List of Abbreviations (Page 6)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGE 6: LIST OF ABBREVIATIONS & SYMBOLS (4-Column Layout)
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "LIST OF ABBREVIATIONS & SYMBOLS", space_before=20, space_after=12, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    
    abbr_items = [
        ("3NF", "Third Normal Form"),
        ("ACID", "Atomicity, Consistency, Isolation, Durability"),
        ("API", "Application Programming Interface"),
        ("B2B", "Business-to-Business"),
        ("B2C", "Business-to-Consumer"),
        ("CORS", "Cross-Origin Resource Sharing"),
        ("CRUD", "Create, Read, Update, Delete"),
        ("CSS", "Cascading Style Sheets"),
        ("DAG", "Directed Acyclic Graph"),
        ("DAX", "Data Analysis Expressions (Power BI)"),
        ("DFD", "Data Flow Diagram"),
        ("DOM", "Document Object Model"),
        ("DW", "Data Warehouse"),
        ("ER", "Entity-Relationship"),
        ("FK", "Foreign Key"),
        ("FR", "Functional Requirement"),
        ("HTTP", "Hypertext Transfer Protocol"),
        ("HTTPS", "Hypertext Transfer Protocol Secure"),
        ("INR / ₹", "Indian Rupee"),
        ("JSON", "JavaScript Object Notation"),
        ("JWT", "JSON Web Token"),
        ("KPI", "Key Performance Indicator"),
        ("NFR", "Non-Functional Requirement"),
        ("OLAP", "Online Analytical Processing"),
        ("OLTP", "Online Transaction Processing"),
        ("ORM", "Object-Relational Mapping"),
        ("OWASP", "Open Web Application Security Project"),
        ("PK", "Primary Key"),
        ("PRD", "Product Requirements Document"),
        ("RBAC", "Role-Based Access Control"),
        ("REST", "Representational State Transfer"),
        ("SCD", "Slowly Changing Dimension (Type 2)"),
        ("SKU", "Stock Keeping Unit"),
        ("SME", "Small and Medium Enterprises"),
        ("SPA", "Single-Page Application"),
        ("SPIT", "Sardar Patel Institute of Technology"),
        ("SQL", "Structured Query Language"),
        ("SRS", "Software Requirements Specification"),
        ("TLS", "Transport Layer Security"),
        ("UI / UX", "User Interface / User Experience"),
        ("UML", "Unified Modeling Language"),
        ("UQ", "Unique Constraint"),
        ("UUID", "Universally Unique Identifier"),
        ("Vite", "Next Generation Frontend Tooling"),
        ("V8", "Google High-Performance JS Engine")
    ]
    
    # 4-Column Table: Abbr1 | Meaning1 | Abbr2 | Meaning2 (23 rows max, fits cleanly on Page 6!)
    col1 = abbr_items[:23]
    col2 = abbr_items[23:]
    
    abbr_4col_rows = []
    for i in range(23):
        a1, m1 = col1[i]
        a2, m2 = col2[i] if i < len(col2) else ("", "")
        abbr_4col_rows.append((a1, m1, a2, m2))
        
    add_table_data(doc, ["Abbr / Symbol", "Expansion", "Abbr / Symbol", "Expansion"], abbr_4col_rows, [1.1, 2.15, 1.1, 2.15])

    doc.add_page_break()

    print("Building Table of Contents (Pages 7-8)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGES 7-8: TABLE OF CONTENTS (Part 1 on Page 7, Part 2 on Page 8)
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "TABLE OF CONTENTS", space_before=20, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    
    add_toc_item(doc, "CERTIFICATE OF APPROVAL", "2", level=1, is_bold=True)
    add_toc_item(doc, "DECLARATION", "3", level=1, is_bold=True)
    add_toc_item(doc, "ACKNOWLEDGEMENT", "4", level=1, is_bold=True)
    add_toc_item(doc, "ABSTRACT", "5", level=1, is_bold=True)
    add_toc_item(doc, "LIST OF ABBREVIATIONS & SYMBOLS", "6", level=1, is_bold=True)
    add_toc_item(doc, "TABLE OF CONTENTS", "7", level=1, is_bold=True)
    add_toc_item(doc, "LIST OF FIGURES AND TABLES", "9", level=1, is_bold=True)
    
    add_toc_item(doc, "CHAPTER 1: INTRODUCTION AND PROBLEM DEFINITION", "11", level=1, is_bold=True)
    add_toc_item(doc, "1.1 Context and Background", "11", level=2)
    add_toc_item(doc, "1.2 Problem Definition", "12", level=2)
    add_toc_item(doc, "1.3 Scope and Objectives", "13", level=2)
    add_toc_item(doc, "1.4 Methodology and APNI Leap Alignment", "14", level=2)
    add_toc_item(doc, "1.5 Report Organization", "15", level=2)
    
    add_toc_item(doc, "CHAPTER 2: LITERATURE REVIEW AND STUDY OF EXISTING SYSTEMS", "16", level=1, is_bold=True)
    add_toc_item(doc, "2.1 Domain Overview and Industry Landscape", "16", level=2)
    add_toc_item(doc, "2.2 Survey of Existing Platforms", "17", level=2)
    add_toc_item(doc, "2.3 Comparative Evaluation Matrix", "18", level=2)
    add_toc_item(doc, "2.4 Research Gaps and Architectural Opportunities", "19", level=2)
    
    add_toc_item(doc, "CHAPTER 3: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)", "20", level=1, is_bold=True)
    add_toc_item(doc, "3.1 User Roles and System Personas", "20", level=2)
    add_toc_item(doc, "3.2 Functional Requirements (FR-01 to FR-12)", "21", level=2)
    add_toc_item(doc, "3.3 Non-Functional Requirements (NFR-01 to NFR-10)", "23", level=2)
    add_toc_item(doc, "3.4 Hardware and Software Operating Constraints", "25", level=2)
    add_toc_item(doc, "3.5 Requirements Traceability Matrix", "26", level=2)
    
    add_toc_item(doc, "CHAPTER 4: SYSTEM ARCHITECTURE AND DESIGN", "28", level=1, is_bold=True)
    add_toc_item(doc, "4.1 System Architecture and Decoupled 3-Tier Model", "28", level=2)
    add_toc_item(doc, "4.2 Architecture Diagrams (C4 Level 1 & 2)", "30", level=2)
    add_toc_item(doc, "4.3 Security Architecture and Trust Boundaries", "32", level=2)
    add_toc_item(doc, "4.4 Data Flow and Formal Use Case Specifications", "34", level=2)
    add_toc_item(doc, "4.5 Sequence Diagrams (Connection & Collaboration)", "36", level=2)
    add_toc_item(doc, "4.6 Activity and State Diagrams (8-State Automaton)", "38", level=2)
    add_toc_item(doc, "4.7 Database Schema Design (OLTP 3NF & OLAP Star Schema)", "40", level=2)
    add_toc_item(doc, "4.8 Security, Token Lifecycle and Error-Handling Architecture", "42", level=2)
    
    # Page break to Page 8 of TOC
    doc.add_page_break()
    add_p(doc, "TABLE OF CONTENTS (CONTINUED)", space_before=20, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    
    add_toc_item(doc, "CHAPTER 5: ALGORITHM DESIGN AND DATA STRUCTURES", "44", level=1, is_bold=True)
    add_toc_item(doc, "5.1 Multi-Criteria Matching Engine Formulation", "44", level=2)
    add_toc_item(doc, "5.2 Algorithmic Flow and Execution Pipeline", "46", level=2)
    add_toc_item(doc, "5.3 Data Structures and Space/Time Complexity", "47", level=2)
    add_toc_item(doc, "5.4 Algorithmic Invariants and Correctness Proofs", "49", level=2)
    
    add_toc_item(doc, "CHAPTER 6: SUBJECT-WISE ENGINEERING CONCEPTS AND APNI LEAP ALIGNMENT", "51", level=1, is_bold=True)
    add_toc_item(doc, "6.1 Curricular Engineering Foundations (DSA, DBMS, Networks, OS, SE, Security)", "51", level=2)
    add_toc_item(doc, "6.2 SPIT APNI Leap Pedagogical Model Alignment", "53", level=2)
    
    add_toc_item(doc, "CHAPTER 7: IMPLEMENTATION AND MODULE-WISE CODING", "55", level=1, is_bold=True)
    add_toc_item(doc, "7.1 Technical Stack and Runtime Environment", "55", level=2)
    add_toc_item(doc, "7.2 Codebase Organization and Repository Architecture", "56", level=2)
    add_toc_item(doc, "7.3 Module Implementation Highlights", "57", level=2)
    add_toc_item(doc, "7.4 Comprehensive REST API Route Catalog", "59", level=2)
    add_toc_item(doc, "7.5 Version Control, Commit Analytics, and Team Contributions", "61", level=2)
    
    add_toc_item(doc, "CHAPTER 8: SCALABILITY, PERFORMANCE AND RESOURCE MANAGEMENT", "63", level=1, is_bold=True)
    add_toc_item(doc, "8.1 Workload Characterization and Resource Modeling", "63", level=2)
    add_toc_item(doc, "8.2 Empirical Performance Benchmarks and Latency Analysis", "64", level=2)
    add_toc_item(doc, "8.3 Database Indexing, Query Optimization, and Execution Plans", "65", level=2)
    add_toc_item(doc, "8.4 Horizontal Scalability and Stateless Architecture", "66", level=2)
    add_toc_item(doc, "8.5 Architectural Bottlenecks and High-Availability Failure Scenarios", "67", level=2)
    
    add_toc_item(doc, "CHAPTER 9: TESTING AND VALIDATION", "69", level=1, is_bold=True)
    add_toc_item(doc, "9.1 Testing Strategy and Test Architecture", "69", level=2)
    add_toc_item(doc, "9.2 Comprehensive Test Case Traceability Matrix (TC-01 to TC-26)", "70", level=2)
    add_toc_item(doc, "9.3 System Verification and Key Performance Indicators (KPI) Evaluation", "73", level=2)
    
    add_toc_item(doc, "CHAPTER 10: RESULTS, DEMONSTRATION AND DISCUSSION", "75", level=1, is_bold=True)
    add_toc_item(doc, "10.1 Operational Results and Evaluation", "75", level=2)
    add_toc_item(doc, "10.2 System Demonstration Walkthroughs (Figures 10.1 to 10.13)", "77", level=2)
    add_toc_item(doc, "10.3 Discussion and Synthesis", "84", level=2)
    
    add_toc_item(doc, "CHAPTER 11: CONCLUSION AND FUTURE SCOPE", "86", level=1, is_bold=True)
    add_toc_item(doc, "11.1 Project Summary and Engineering Synthesis", "86", level=2)
    add_toc_item(doc, "11.2 Critical Engineering Reflection and System Limitations", "87", level=2)
    add_toc_item(doc, "11.3 Future Research and Engineering Directions", "88", level=2)
    
    add_toc_item(doc, "REFERENCES & BIBLIOGRAPHY", "90", level=1, is_bold=True)
    add_toc_item(doc, "APPENDIX: PLAGIARISM VERIFICATION REPORT", "92", level=1, is_bold=True)
    
    doc.add_page_break()

    print("Building List of Figures and Tables (Pages 9-10)...")
    # ═══════════════════════════════════════════════════════════════
    # PAGE 9: LIST OF FIGURES
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "LIST OF FIGURES", space_before=20, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    
    figures_list = [
        ("Figure 4.1", "BizLink decoupled 3-tier system architecture", "28"),
        ("Figure 4.2", "System context diagram (Level-1 C4 model)", "30"),
        ("Figure 4.6", "Security architecture and discrete trust boundaries", "32"),
        ("Figure 4.7", "Level-1 data flow diagram (processes, data stores, actors)", "34"),
        ("Figure 4.9", "Sequence diagram: B2B connection request and handshake", "36"),
        ("Figure 4.10", "Sequence diagram: Collaboration proposal and contract machine", "37"),
        ("Figure 4.12", "State diagram: 8-state collaboration contract lifecycle", "38"),
        ("Figure 5.1", "Multi-criteria matching engine execution pipeline", "46"),
        ("Figure 10.1", "BizLink Enterprise Landing Page", "77"),
        ("Figure 10.2", "Authentication Modal with Role-Gated Onboarding", "77"),
        ("Figure 10.3", "Enterprise Dashboard with Dual-Track Service & Need Management", "78"),
        ("Figure 10.4", "B2B Marketplace Discovery with Multi-Facet Filtering", "78"),
        ("Figure 10.5", "Explainable Match Score Badge and Factor Decomposition Tooltip", "79"),
        ("Figure 10.6", "Comprehensive Business Profile with Capabilities & Trust Badges", "79"),
        ("Figure 10.7", "B2B Connection Management & Incoming Request Network", "80"),
        ("Figure 10.8", "Two-Pane Enterprise Direct Messaging Workspace", "80"),
        ("Figure 10.9", "Contract Collaboration Workspace and Milestone State Tracker", "81"),
        ("Figure 10.10", "Post-Collaboration 5-Star Verified Review Modal", "81"),
        ("Figure 10.11", "B2B Commercial Community Feed & Peer Interaction Stream", "82"),
        ("Figure 10.12", "Admin Moderation Console & Business Verification Queue", "82"),
        ("Figure 10.13", "Executive Power BI Dashboard — Apple Analytics Edition", "83")
    ]
    for fig_id, fig_title, fig_p in figures_list:
        add_toc_item(doc, f"{fig_id}: {fig_title}", fig_p, level=1)
        
    doc.add_page_break()

    # ═══════════════════════════════════════════════════════════════
    # PAGE 10: LIST OF TABLES
    # ═══════════════════════════════════════════════════════════════
    add_p(doc, "LIST OF TABLES", space_before=20, space_after=14, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=14)
    
    tables_list = [
        ("Table 1.1", "Project stakeholders and operational responsibilities", "13"),
        ("Table 1.2", "Scope matrix: In-scope capabilities vs. Out-of-scope boundaries", "14"),
        ("Table 2.1", "Comparative evaluation matrix of existing B2B systems", "18"),
        ("Table 3.1", "User personas and system characteristic profiles", "20"),
        ("Table 3.2", "Functional requirements specification (FR-01 to FR-12)", "21"),
        ("Table 3.3", "Non-functional requirements specification (NFR-01 to NFR-10)", "23"),
        ("Table 3.4", "Hardware and environmental operating constraints", "25"),
        ("Table 3.5", "Software interface and runtime environment constraints", "25"),
        ("Table 3.6", "Requirements traceability matrix (RTM)", "26"),
        ("Table 4.1", "Primary architectural tiers, components, and responsibilities", "29"),
        ("Table 4.2", "Formal use-case specifications (UC-01 to UC-09)", "35"),
        ("Table 4.3", "Relational database schema entity groups and storage roles", "40"),
        ("Table 5.1", "Core algorithmic data structures and access patterns", "47"),
        ("Table 5.2", "Algorithmic design trade-offs and complexity rationale", "48"),
        ("Table 5.3", "Time and space complexity bounds of algorithmic routines", "48"),
        ("Table 6.1", "Curricular engineering concepts, application, and exclusions", "52"),
        ("Table 6.2", "APNI Leap stage-gate verification and milestone audit matrix", "54"),
        ("Table 7.1", "Production and development technology stack", "55"),
        ("Table 7.4", "Comprehensive REST API route catalog and access policies", "59"),
        ("Table 7.5", "Audited team member contributions and commit attribution", "61"),
        ("Table 8.1", "Workload modeling assumptions and concurrency boundaries", "63"),
        ("Table 8.2", "Empirical performance benchmarks and latency audit", "64"),
        ("Table 8.3", "Identified architectural bottlenecks and mitigations", "67"),
        ("Table 8.4", "System failure modes and automated recovery behaviors", "68"),
        ("Table 9.1", "Automated test suite hierarchy and execution summary", "69"),
        ("Table 9.2", "Comprehensive test case traceability matrix (TC-01 to TC-26)", "70"),
        ("Table 9.3", "Target KPIs vs. measured empirical verification results", "73"),
        ("Table 10.1", "Implemented platform features and operational status", "75"),
        ("Table 10.3", "Qualitative objectives vs. empirical deliverables matrix", "85"),
        ("Table A.1", "Official academic plagiarism verification audit summary", "92")
    ]
    for tbl_id, tbl_title, tbl_p in tables_list:
        add_toc_item(doc, f"{tbl_id}: {tbl_title}", tbl_p, level=1)
        
    doc.add_page_break()
    print("Preliminary pages completed successfully. Chapter 1 begins cleanly on Page 11.")

