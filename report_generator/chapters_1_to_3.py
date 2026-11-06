"""
chapters_1_to_3.py
Constructs Chapters 1, 2, and 3 for the BizLink academic report.
- Chapter 1: Introduction, Problem Definition, Scope & APNI Leap Alignment
- Chapter 2: Literature Review, Existing Platform Study & Comparative Matrix
- Chapter 3: Software Requirements Specification (SRS) with Full Traceability
"""

from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from .helpers import (
    add_p, add_heading_1, add_heading_2, add_heading_3, add_table_data, add_callout
)

def build_chapters_1_to_3(doc):
    print("Building Chapter 1: Introduction and Problem Definition...")
    # ═══════════════════════════════════════════════════════════════
    # CHAPTER 1: INTRODUCTION AND PROBLEM DEFINITION
    # ═══════════════════════════════════════════════════════════════
    add_heading_1(doc, "CHAPTER 1: INTRODUCTION AND PROBLEM DEFINITION")
    
    add_heading_2(doc, "1.1 Context and Background")
    add_p(
        doc,
        "Small and medium enterprises (SMEs) form the economic backbone of developing and developed economies alike, accounting "
        "for over 90% of all businesses and upwards of 50% of total employment worldwide. In the Indian domestic market, the Micro, "
        "Small, and Medium Enterprise (MSME) sector contributes approximately 30% of the Gross Domestic Product (GDP) and nearly 45% "
        "of total manufacturing exports. Despite their foundational economic importance, SMEs operate within fragmented business "
        "environments characterized by severe information asymmetry, informal procurement workflows, and highly restricted discovery "
        "channels. Unlike multinational corporations that possess dedicated enterprise procurement teams, formal vendor management "
        "systems, and global supplier registries, an SME typically identifies business partners through informal word-of-mouth recommendations, "
        "localized geographic trade associations, and unstructured peer referrals.",
        line_spacing=1.2
    )
    add_p(
        doc,
        "The digital transformation of enterprise commerce over the preceding two decades has largely bypassed the nuanced, relationship-driven "
        "requirements of inter-business discovery. The prevailing paradigm forces SMEs to choose between two fundamentally flawed digital channels: "
        "horizontal social networking platforms (e.g., LinkedIn) and lead-generation trade directories (e.g., IndiaMART, Justdial). Horizontal networks "
        "are architected around individual human careers, curriculum vitae resumes, and personal brand broadcasting; they lack domain structures "
        "to represent an enterprise's operational capacity, concrete procurement specifications, or verifiable service-level guarantees. "
        "Conversely, commercial trade directories operate on monetization models driven by search placement bidding and aggressive lead distribution. "
        "A single procurement inquiry is routinely broadcast to dozens of unverified vendors simultaneously, inundating the buyer with unsolicited "
        "telemarketing calls while offering zero verifiable proof of vendor competence, creditworthiness, or performance history.",
        line_spacing=1.2
    )
    add_p(
        doc,
        "BizLink emerges directly from the recognition that business-to-business (B2B) discovery is fundamentally distinct from consumer retail "
        "e-commerce or individual career networking. B2B transactions require precise alignment across multidimensional criteria: domain taxonomy, "
        "budget-price intervals, geographic logistics, and verified institutional trust. BizLink establishes a structured, transparent, and "
        "explainable digital environment wherein enterprises manage dual-track profiles—simultaneously articulating what they offer to the "
        "market and what they need to procure—governed by automated matching algorithms, contractual collaboration workflows, and closed-loop "
        "verified reputation mechanisms.",
        line_spacing=1.2
    )

    add_heading_2(doc, "1.2 Problem Definition")
    add_p(
        doc,
        "The fundamental research and engineering problem addressed by BizLink is formally stated as follows: "
        "To design, develop, and empirically evaluate a structured, full-stack B2B business discovery and collaboration platform that eliminates "
        "informal networking friction, provides transparent and explainable multi-criteria partner recommendations, enforces state-governed "
        "contractual collaboration lifecycles, and maintains an auditable, closed-loop trust and reputation mechanism, supported by an executive-grade "
        "business intelligence architecture.",
        line_spacing=1.2, italic=True
    )
    add_p(
        doc,
        "Specifically, the core operational deficiencies in existing enterprise discovery environments comprise four critical challenges:\n"
        "1. Unstructured Representation of Enterprise Capabilities: Existing platforms fail to separate an organization's outward commercial "
        "services from its inward procurement requirements, leading to ambiguous directory searches and manual requirement vetting.\n"
        "2. Algorithmic Opacity and Ineffective Partner Matching: Traditional directories rely on keyword substring matching or proprietary, "
        "opaque pay-per-click bidding that promotes advertisers rather than qualified operational partners.\n"
        "3. Absence of Formalized Collaboration Lifecycles: Current communication tools (such as email, WhatsApp, or instant messaging) provide "
        "no state-governed progression from initial handshake to contractual agreement, milestone tracking, and verified completion.\n"
        "4. Vulnerability to Fabricated and Spam Reviews: Open review systems permit anonymous or unearned feedback, distorting trust indices "
        "and enabling malicious reputation inflation or extortion.",
        line_spacing=1.2
    )

    add_heading_2(doc, "1.3 Scope and Objectives")
    add_p(
        doc,
        "The project is bounded by rigorous functional and architectural objectives designed to deliver an enterprise-grade platform. "
        "Table 1.1 defines the primary stakeholders and their operational responsibilities within the BizLink ecosystem:",
        line_spacing=1.2
    )
    
    stakeholders_data = [
        ("SME Business Owners & Procurement Leads", "Manage enterprise profiles, publish service offerings, post commercial procurement needs, review algorithmic compatibility breakdowns, initiate stateful connection handshakes, and negotiate collaborative contracts."),
        ("B2B Service Providers & Specialist Vendors", "Discover active procurement requirements matching operational capabilities, submit proposals, execute milestone deliverables within governed collaboration lifecycles, and earn verified ratings."),
        ("Platform Compliance & Administrative Officers", "Perform identity and enterprise document verification (KYC), monitor community compliance, resolve governance reports, and oversee platform security."),
        ("Executive Leadership & Operations Analysts", "Monitor cross-industry liquidity, evaluate procurement pipeline metrics, analyze geographic concentration, and assess platform health via Power BI analytics dashboards.")
    ]
    add_table_data(doc, ["Stakeholder Persona", "Operational Responsibilities & Platform Interaction"], stakeholders_data, [2.2, 4.3])

    add_p(
        doc,
        "Table 1.2 delineates the explicit boundary between the functional capabilities implemented within the scope of this project "
        "and architectural extensions reserved for subsequent production iterations:",
        space_before=8, space_after=6, line_spacing=1.2
    )
    scope_data = [
        ("Identity & Access Management", "JWT authentication, bcrypt password hashing, Role-Based Access Control (RBAC: OWNER, PARTNER, ADMIN).", "Third-party enterprise SSO (SAML / Okta) and biometric authentication."),
        ("Catalog Management", "Dual-track profiles (Services vs. Needs) with budget intervals, deadlines, and hierarchical taxonomy.", "Dynamic SKU-level inventory synchronization via ERP connectors."),
        ("Matching Engine", "Explainable 4-factor scoring (Taxonomy, Budget, Proximity, Trust) with breakdown modals.", "Opaque black-box deep learning or latent semantic embedding models."),
        ("Collaboration Management", "8-state finite state machine, milestone delivery tracking, and role-gated mutations.", "Cryptographic legal smart contract execution on public blockchain networks."),
        ("Reputation & Review", "Closed-loop 5-star ratings strictly gated to verified completed collaborations.", "Unrestricted open public review boards or third-party web scraping."),
        ("Analytics & Intelligence", "MySQL analytics star schema with SCD Type 2 and executive Microsoft Power BI dashboards.", "Real-time stream processing engines (Apache Kafka / Flink clusters).")
    ]
    add_table_data(doc, ["Subsystem Domain", "In-Scope Engineering Deliverables", "Out-of-Scope Boundaries"], scope_data, [1.6, 2.7, 2.2])

    add_heading_2(doc, "1.4 Methodology and APNI Leap Alignment")
    add_p(
        doc,
        "BizLink was engineered under the APNI Leap academic and professional model established by Sardar Patel Institute of Technology. "
        "The project progressed through four rigorous, interdependent phases:\n"
        "• Align: Identifying real-world operational friction within domestic SME procurement and aligning solution architecture with "
        "curricular principles of database engineering, networking protocols, and systems design.\n"
        "• Plan: Authoring exhaustive Product Requirements Documents (PRD v9 across 11 modules), defining formal schema normalizations (3NF), "
        "and constructing comprehensive UML blueprints.\n"
        "• Nurture: Executing a disciplined four-layer gated development lifecycle (Database -> Backend API -> Frontend SPA -> Power BI BI), "
        "validating each tier against automated test suites before advancing.\n"
        "• Innovate (Leap): Implementing algorithmic breakthroughs including a mathematically bounded, explainable 4-factor matching engine, "
        "a zero-trust post-contract review gating mechanism, and an Apple Analytics-inspired Power BI suite backed by SCD Type 2 dimensional tables.",
        line_spacing=1.2
    )

    add_heading_2(doc, "1.5 Report Organization")
    add_p(
        doc,
        "The remainder of this report is organized as follows: Chapter 2 surveys existing enterprise discovery platforms and formalizes the "
        "theoretical research gap. Chapter 3 defines the Software Requirements Specification (SRS), detailing 12 functional requirements, "
        "10 non-functional constraints, and the complete traceability matrix. Chapter 4 provides exhaustive architectural blueprints, including "
        "C4 models, sequence diagrams, state automata, and dual-schema database designs. Chapter 5 details algorithm formulation, pseudo-code, "
        "and asymptotic complexity proofs. Chapter 6 articulates curricular alignment and APNI Leap milestones. Chapter 7 outlines full-stack "
        "implementation, module architectures, and Git contribution analytics. Chapter 8 evaluates scalability, database indexing, and failure "
        "modes. Chapter 9 presents the automated test suites and KPI verification results. Chapter 10 provides visual walkthroughs and discussion. "
        "Chapter 11 concludes the report and outlines future research trajectories.",
        line_spacing=1.2
    )

    doc.add_page_break()

    print("Building Chapter 2: Literature Review and Study of Existing Systems...")
    # ═══════════════════════════════════════════════════════════════
    # CHAPTER 2: LITERATURE REVIEW AND STUDY OF EXISTING SYSTEMS
    # ═══════════════════════════════════════════════════════════════
    add_heading_1(doc, "CHAPTER 2: LITERATURE REVIEW AND STUDY OF EXISTING SYSTEMS")
    
    add_heading_2(doc, "2.1 Domain Overview and Industry Landscape")
    add_p(
        doc,
        "Business-to-business discovery has increasingly attracted computational and information systems research over the past decade. "
        "Scholars have investigated how digital multi-sided platforms reduce transaction search costs, mitigate information asymmetry, and "
        "facilitate relational contracting between organizational entities. In classical transaction cost economics (Williamson, 1985), "
        "inter-firm collaboration is hindered by search and information costs, bargaining costs, and policing/enforcement costs. Modern "
        "digital platforms seek to minimize these transaction costs by creating structured environments for capability advertisement, "
        "algorithmic matchmaking, and reputation tracking.",
        line_spacing=1.2
    )
    add_p(
        doc,
        "However, commercial implementations of enterprise networking tools have evolved along divergent, suboptimal paths. Horizontal social "
        "media networks monetize user attention and professional job mobility, while vertical commercial directories monetize seller advertising "
        "spend. Consequently, neither model addresses the core engineering challenge of structured, mutual operational compatibility.",
        line_spacing=1.2
    )

    add_heading_2(doc, "2.2 Survey of Existing Platforms")
    add_p(
        doc,
        "To establish an empirical baseline, the engineering team conducted an in-depth survey of prevailing enterprise networking and discovery platforms:\n"
        "1. LinkedIn: Operates as the dominant horizontal professional network globally. While proficient at individual resume hosting and "
        "content publishing, corporate pages on LinkedIn are passive branding showcases. The platform provides no native constructs for posting "
        "formal commercial RFQs (Request for Quotations), lacks budget-bounded interval discovery, and offers no native contractual state machines.\n"
        "2. IndiaMART: Represents the largest domestic B2B trade directory in India. The platform relies on a pay-per-lead business model where "
        "buyer RFQs are syndicated across numerous paid suppliers. This results in aggressive telemarketing, bid dilution, and buyer exhaustion. "
        "Furthermore, search results are ordered primarily by vendor subscription tiers rather than verified capability or mathematical compatibility.\n"
        "3. Justdial: Operates as a local consumer-to-business (C2B) directory. Although widely utilized for localized service queries, it lacks "
        "enterprise procurement taxonomies, provides no support for collaborative agreements, and suffers from unverified, easily manipulated review systems.\n"
        "4. Upwork / Freelancer: Deliver robust milestone-based contract tracking and escrow mechanisms, but cater strictly to individual "
        "freelancers rather than inter-enterprise partnerships, multi-member corporate accounts, or industrial procurement supply chains.",
        line_spacing=1.2
    )

    add_heading_2(doc, "2.3 Comparative Evaluation Matrix")
    add_p(
        doc,
        "Table 2.1 provides a systematic comparative evaluation of BizLink against prevailing market alternatives across eight foundational "
        "architectural and operational dimensions:",
        line_spacing=1.2
    )
    
    comp_data = [
        ("Dual-Track Profiles (Services & Needs)", "No (Profiles showcase personal resumes / branding)", "Partial (Buyers post RFQs, sellers list catalogs separately)", "No (Single commercial listing format)", "Yes (Full dual-track representation with budget intervals)"),
        ("Transparent Matching Engine", "No (Opaque social graph & recruiter search)", "No (Monetized bid auction & sponsored ranking)", "No (Paid priority listing algorithms)", "Yes (Deterministic 4-factor scoring with explainable tooltips)"),
        ("Spam Protection & Connection Gating", "Low (Unrestricted InMail and connection spam)", "Zero (Immediate syndication to paid lead subscribers)", "Zero (Aggressive phone/SMS telemarketing)", "High (Mutual handshake required before messaging)"),
        ("Collaborative Contract Lifecycle", "None (Redirects to external email / legal)", "None (Offline negotiation)", "None (Offline communication)", "Yes (8-state finite state machine with milestone tracking)"),
        ("Review & Reputation Integrity", "Unverified (Endorsements from personal contacts)", "Vulnerable (Unverified reviews, paid moderation)", "Vulnerable (Subject to review fabrication)", "Strict (Closed-loop gating: reviews only after COMPLETED contracts)"),
        ("Enterprise Multi-Member Roles", "No (Individual user accounts only)", "Limited (Single enterprise admin login)", "No (Single account ownership)", "Yes (RBAC: OWNER, PARTNER, ADMIN within enterprises)"),
        ("Analytics & Business Intelligence", "Premium career analytics (Recruiter/Sales)", "Vendor lead performance metrics", "Click and impression analytics", "Enterprise Power BI Suite (Apple Analytics Edition) + SCD2 DW"),
        ("Monetization & Partner Neutrality", "Ad-supported / Recruiter subscription", "Paid ranking / Pay-per-lead model", "Paid ranking / Subscription tiers", "Neutral algorithmic ranking based strictly on verified merit")
    ]
    add_table_data(doc, ["Architectural Dimension", "LinkedIn", "IndiaMART", "Justdial", "BizLink Platform"], comp_data, [1.4, 1.2, 1.2, 1.2, 1.5])

    add_heading_2(doc, "2.4 Research Gaps and Architectural Opportunities")
    add_p(
        doc,
        "The comparative analysis reveals three primary architectural opportunities that BizLink directly fulfills:\n"
        "• Gap 1: Lack of Algorithmic Transparency. Existing directories operate as black boxes, prioritizing paid advertisers. BizLink introduces "
        "an explainable multi-criteria matching formulation ($S_{total}$) with transparent factor breakdowns, establishing quantifiable partner trust.\n"
        "• Gap 2: Disconnection Between Discovery and Execution. Platforms drop users once contact information is exchanged. BizLink maintains "
        "continuity through a governed 8-stage collaboration state machine that monitors project milestones from DRAFT to COMPLETED.\n"
        "• Gap 3: Review Fabrication and Reputation Inflation. Open platforms suffer from fraudulent ratings. BizLink enforces cryptographic and "
        "relational integrity, guaranteeing that reviews can only be submitted by verified participants of successfully executed collaborations.",
        line_spacing=1.2
    )

    doc.add_page_break()

    print("Building Chapter 3: Software Requirements Specification (SRS)...")
    # ═══════════════════════════════════════════════════════════════
    # CHAPTER 3: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
    # ═══════════════════════════════════════════════════════════════
    add_heading_1(doc, "CHAPTER 3: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)")
    
    add_heading_2(doc, "3.1 User Roles and System Personas")
    add_p(
        doc,
        "The BizLink platform defines three distinct authenticated user personas alongside unauthenticated public visitors. "
        "Table 3.1 details the role permissions, operational goals, and security boundaries for each persona:",
        line_spacing=1.2
    )
    
    personas_data = [
        ("Public Visitor", "Unauthenticated guest browsing the web client.", "View public landing page, browse category taxonomy, search high-level directory listings.", "Read-only access; restricted from viewing contact details, initiating connections, or sending messages."),
        ("Business Owner (OWNER)", "Authenticated enterprise founder or primary executive.", "Full administrative authority over business entity, publish services, post needs, invite staff members, execute contracts, submit reviews.", "Full CRUD permissions over owned corporate entity; gated by JWT authentication and RBAC checks."),
        ("Business Partner / Staff (PARTNER)", "Authenticated enterprise delegate or operations manager.", "Manage day-to-day messaging, review incoming connection requests, update milestone deliverables, participate in collaborations.", "Scoped access; restricted from transferring business ownership, mutating core legal slugs, or deleting enterprise profile."),
        ("Platform Administrator (ADMIN)", "Internal compliance officer and platform regulator.", "Audit enterprise verification queues, inspect reported content, suspend non-compliant accounts, monitor cross-system analytics.", "Elevated administrative privileges; gated by strict RBAC middleware; restricted from altering contract terms.")
    ]
    add_table_data(doc, ["System Persona", "Authentication Profile", "Primary Operational Goals", "Security Perimeter & Access Scope"], personas_data, [1.4, 1.4, 1.8, 1.9])

    add_heading_2(doc, "3.2 Functional Requirements (FR-01 to FR-12)")
    add_p(
        doc,
        "The system enforces 12 comprehensive functional requirements across all architectural layers, as formalized in Table 3.2:",
        line_spacing=1.2
    )
    
    fr_data = [
        ("FR-01", "User Authentication & Identity Issuance", "System shall authenticate users via bcrypt password hashing (10 rounds) and issue stateless HMAC-SHA256 JWT bearer tokens (24-hour expiration) encoding user ID and global role.", "Mandatory"),
        ("FR-02", "Enterprise Profile & Taxonomy Binding", "System shall allow authenticated users to register corporate entities with unique URL slugs, contact metadata, and hierarchical category bindings.", "Mandatory"),
        ("FR-03", "Dual-Track Service Catalog Management", "System shall permit enterprises to publish structured service offerings with titles, descriptions, category slugs, and bounded price ranges [price_min, price_max].", "Mandatory"),
        ("FR-04", "Dual-Track Procurement Need Posting", "System shall allow enterprises to post commercial procurement requirements specifying budget intervals [budget_min, budget_max], fulfillment deadlines, and required categories.", "Mandatory"),
        ("FR-05", "Multi-Facet Marketplace Discovery", "System shall provide a high-performance search interface supporting full-text keyword queries, category tree navigation, and geographical city filtering.", "Mandatory"),
        ("FR-06", "Explainable Need-Service Match Scoring", "System shall calculate deterministic compatibility scores across taxonomy (35%), budget overlap (25%), geography (20%), and trust rating (20%), returning factor breakdowns.", "Mandatory"),
        ("FR-07", "B2B Connection Handshake Management", "System shall enforce stateful connection lifecycles (PENDING, ACCEPTED, REJECTED) between enterprise pairs, preventing unsolicited messaging before mutual consent.", "Mandatory"),
        ("FR-08", "Direct Two-Pane Enterprise Messaging", "System shall provide a real-time messaging interface displaying active conversation threads and chronological message histories between connected enterprises.", "Mandatory"),
        ("FR-09", "Governed Collaboration State Machine", "System shall advance collaborative contracts across an 8-state automaton (DRAFT -> REQUESTED -> NEGOTIATING -> ACCEPTED -> ACTIVE -> COMPLETED), barring out-of-order transitions.", "Mandatory"),
        ("FR-10", "Closed-Loop Verified Review Gating", "System shall permit review submission strictly upon reaching COMPLETED collaboration status, updating the recipient business's trust rating atomically.", "Mandatory"),
        ("FR-11", "Commercial Community Announcements", "System shall support enterprise micro-posts with atomic like toggles and threaded discussion comments to foster industry peer engagement.", "Desirable"),
        ("FR-12", "Administrative Governance & Analytics", "System shall provide an administrative console for business verification and content moderation, backed by curated SQL reporting views for Power BI analytics.", "Mandatory")
    ]
    add_table_data(doc, ["Req ID", "Functional Requirement Name", "Detailed Behavioral Specification", "Priority"], fr_data, [0.8, 1.8, 3.2, 0.7])

    add_heading_2(doc, "3.3 Non-Functional Requirements (NFR-01 to NFR-10)")
    add_p(
        doc,
        "Table 3.3 formalizes 10 non-functional requirements governing system performance, security, reliability, and maintainability:",
        line_spacing=1.2
    )
    
    nfr_data = [
        ("NFR-01", "API Response Latency", "95th percentile (p95) API response time shall remain below 150 ms under concurrent load of 100 requests/sec for all standard read queries.", "Performance"),
        ("NFR-02", "Algorithmic Match Latency", "Explainable match score computation for a candidate batch of 25 services shall execute in under 30 ms.", "Performance"),
        ("NFR-03", "Transport & Data Security", "All client-server communications shall enforce TLS 1.3 encryption. Passwords shall be salted and hashed via bcrypt (>= 10 rounds).", "Security"),
        ("NFR-04", "SQL Injection Elimination", "Database persistence layer shall exclusively utilize parameterized prepared statements through mysql2, eliminating CWE-89 injection flaws.", "Security"),
        ("NFR-05", "Database ACID Integrity", "All multi-table mutations (collaborations, reviews, membership updates) shall execute within strict database transaction boundaries.", "Reliability"),
        ("NFR-06", "Historical Data Preservation", "Analytics star schema shall implement Slowly Changing Dimensions (SCD Type 2) to maintain complete auditability of profile updates.", "Maintainability"),
        ("NFR-07", "Responsive Client Rendering", "Web client shall render responsively across mobile (375px), tablet (768px), and desktop (1440px) viewports with zero horizontal overflow.", "Usability"),
        ("NFR-08", "Frontend Asset Optimization", "Production JavaScript bundle size shall not exceed 350 KB (gzipped), ensuring initial First Contentful Paint (FCP) under 1.5 s.", "Performance"),
        ("NFR-09", "Graceful Error Degradation", "API shall return standardized JSON error envelopes ({ success: false, error: { message, code } }) without exposing raw stack traces.", "Reliability"),
        ("NFR-10", "High Availability & Statelessness", "Application runtime shall maintain zero in-memory session affinity, allowing seamless horizontal scaling behind reverse proxies.", "Scalability")
    ]
    add_table_data(doc, ["Req ID", "Quality Attribute", "Verifiable Engineering Specification", "Category"], nfr_data, [0.8, 1.6, 3.3, 0.8])

    add_heading_2(doc, "3.4 Hardware and Software Operating Constraints")
    add_p(
        doc,
        "Table 3.4 and Table 3.5 detail the minimal and recommended operational environments across host infrastructure and client runtimes:",
        line_spacing=1.2
    )
    
    hw_data = [
        ("Production Host Server", "Quad-core x86_64 CPU (2.4 GHz+), 8 GB RAM, 50 GB NVMe SSD storage, 1 Gbps network interface."),
        ("Development Staging Node", "Dual-core x86_64 or ARM64 CPU (Apple Silicon M-series / Intel Core i5), 4 GB RAM, 20 GB free disk space."),
        ("Client Workstation", "Standard modern personal computer, tablet, or mobile device with minimum 2 GB RAM and active internet connection.")
    ]
    add_table_data(doc, ["Deployment Tier", "Hardware Specification & Capacity Constraints"], hw_data, [2.0, 4.5])

    sw_data = [
        ("Host Operating System", "Ubuntu Linux 22.04 LTS (Production) / Windows 11 Enterprise (Development Staging)."),
        ("Runtime Environment", "Node.js 20.x LTS (V8 JavaScript Runtime) with npm 10.x package manager."),
        ("Relational Persistence", "MySQL Community Edition 8.0 with InnoDB Storage Engine and UTF8MB4 charset."),
        ("Client Web Browsers", "Google Chrome 120+, Mozilla Firefox 120+, Apple Safari 17+, Microsoft Edge 120+."),
        ("Analytics & BI Suite", "Microsoft Power BI Desktop (Version 2.128+) with DirectQuery / Curated SQL View import.")
    ]
    add_table_data(doc, ["Software Component", "Operating Specification & Version Requirements"], sw_data, [2.0, 4.5])

    add_heading_2(doc, "3.5 Requirements Traceability Matrix")
    add_p(
        doc,
        "Table 3.6 establishes bidirectional traceability mapping each functional requirement to its implementing database tables, "
        "backend controller, frontend user interface view, automated test suite, and operational verification status:",
        line_spacing=1.2
    )
    
    rtm_data = [
        ("FR-01", "users", "auth.controller.js", "LoginModal.jsx, RegisterModal.jsx", "TC01, TC02, TC03", "Verified"),
        ("FR-02", "businesses, business_members", "business.controller.js", "BusinessProfilePage.jsx", "TC04, TC05", "Verified"),
        ("FR-03", "services", "service.controller.js", "DashboardPage.jsx, ServicesTab.jsx", "TC06, TC07", "Verified"),
        ("FR-04", "needs", "need.controller.js", "DashboardPage.jsx, NeedsTab.jsx", "TC08, TC09", "Verified"),
        ("FR-05", "businesses, services, categories", "discovery.controller.js", "DiscoverPage.jsx", "TC10, TC11", "Verified"),
        ("FR-06", "matches, services, needs", "discovery.controller.js", "MatchScoreBadge.jsx", "TC12, TC13, TC14", "Verified"),
        ("FR-07", "connections", "connection.controller.js", "ConnectionsPage.jsx", "TC15, TC16, TC17", "Verified"),
        ("FR-08", "messages", "message.controller.js", "MessagesPage.jsx", "TC18, TC19", "Verified"),
        ("FR-09", "collaborations, participants", "collaboration.controller.js", "CollaborationsPage.jsx", "TC20, TC21, TC22", "Verified"),
        ("FR-10", "reviews", "review.controller.js", "ReviewModal.jsx, BusinessProfilePage.jsx", "TC23, TC24", "Verified"),
        ("FR-11", "posts, post_interactions", "post.controller.js", "PostsPage.jsx", "TC25, TC26", "Verified"),
        ("FR-12", "reports, views, dw_*", "admin.controller.js, views/", "AdminPage.jsx, Power BI Suite", "Audit Checks", "Verified")
    ]
    add_table_data(doc, ["Req ID", "Database Entities", "Backend Controller", "Frontend UI View", "Test Cases", "Status"], rtm_data, [0.8, 1.4, 1.3, 1.5, 0.9, 0.6])

    doc.add_page_break()
    print("Chapters 1, 2, and 3 completed successfully.")

