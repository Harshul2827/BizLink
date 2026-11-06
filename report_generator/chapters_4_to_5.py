"""
chapters_4_to_5.py
Constructs Chapters 4 and 5 for the BizLink academic report.
- Chapter 4: System Architecture and Design (C4 Models, DFD, Sequences, State Automata, Database Schemas)
- Chapter 5: Algorithm Design and Data Structures (Explainable Matching Formulation, Flow, Complexities & Proofs)
Eliminates monolithic 1-cell tables by using paragraph-styled code blocks for all ASCII diagrams.
"""

from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from .helpers import (
    add_p, add_heading_1, add_heading_2, add_heading_3, add_table_data, add_code_block, add_callout
)

def build_chapters_4_to_5(doc):
    print("Building Chapter 4: System Architecture and Design...")
    # ═══════════════════════════════════════════════════════════════
    # CHAPTER 4: SYSTEM ARCHITECTURE AND DESIGN
    # ═══════════════════════════════════════════════════════════════
    add_heading_1(doc, "CHAPTER 4: SYSTEM ARCHITECTURE AND DESIGN")
    
    add_heading_2(doc, "4.1 System Architecture and Decoupled 3-Tier Model")
    add_p(
        doc,
        "BizLink is engineered as a decoupled three-tier enterprise web application adhering to the principles of separation of concerns, "
        "stateless request handling, and modular component isolation. The presentation tier executes client-side within modern web browsers "
        "as a React 18 Single-Page Application (SPA) bundled via Vite 5. The application tier is driven by a high-concurrency Node.js 20 LTS "
        "runtime hosting an Express.js 4.19 REST API gateway. The data persistence tier leverages MySQL 8.0, partitioned into an operational "
        "Online Transaction Processing (OLTP) schema of 16 normalized tables and an Online Analytical Processing (OLAP) star schema with "
        "Slowly Changing Dimensions (SCD Type 2). The analytical tier directly imports curated SQL views into Microsoft Power BI Desktop to "
        "deliver executive-grade business intelligence.",
        line_spacing=1.2
    )
    
    arch_ascii = (
        "+-----------------------------------------------------------------------+\n"
        "| CLIENT TIER: React 18 SPA | Vite 5 | Tailwind CSS | Axios Client      |\n"
        "| State: AuthContext | Route Guards | Responsive Layout | Theme Engine  |\n"
        "+-----------------------------------+-----------------------------------+\n"
        "                                    | HTTPS / JSON (Bearer JWT)\n"
        "                                    v\n"
        "+-----------------------------------------------------------------------+\n"
        "| API GATEWAY TIER: Node.js 20 LTS + Express 4.19 Server (Port 5000)    |\n"
        "| Security: CORS Whitelist, JWT Verification, RBAC Guards, Helmet       |\n"
        "| Routers: /api/v1/{auth, businesses, discovery, connections, collabs}   |\n"
        "| Services: Matching Engine, State Machine Automaton, Review Gate       |\n"
        "+-----------------------------------+-----------------------------------+\n"
        "                                    | mysql2 Connection Pool (ACID Trx)\n"
        "                                    v\n"
        "+-----------------------------------------------------------------------+\n"
        "| PERSISTENCE TIER: MySQL 8.0 Engine (InnoDB Engine, UTF8MB4)          |\n"
        "| • OLTP Schema: 16 Normalized Tables (users, businesses, services, ...) |\n"
        "| • OLAP Star Schema: 5 Dimensional Tables (dw_dim_*, dw_fact_*) + SCD2 |\n"
        "| • Curated Reporting SQL Views: 7 Materialized Aggregation Views       |\n"
        "+-----------------------------------+-----------------------------------+\n"
        "                                    | Curated SQL Views / Native Import\n"
        "                                    v\n"
        "+-----------------------------------------------------------------------+\n"
        "| ANALYTICS TIER: Microsoft Power BI Desktop (Apple Analytics Edition)  |\n"
        "| Executive KPI Cards | Procurement Funnel | Partner Trust Matrix       |\n"
        "+-----------------------------------------------------------------------+"
    )
    add_code_block(doc, arch_ascii, font_size=8.0)
    p_cap = add_p(doc, "Figure 4.1: BizLink decoupled 3-tier system architecture", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap.paragraph_format.keep_with_next = True

    add_p(
        doc,
        "Table 4.1 outlines the primary responsibilities and verified technology choices across each architectural tier:",
        space_before=6, space_after=6, line_spacing=1.2
    )
    arch_mods = [
        ("Client Tier (Browser)", "React 18.2, Vite 5.2, Tailwind CSS 3.4, Axios, React Router DOM", "Deliver responsive, accessible UI; manage client session tokens; perform input validation; render factor decomposition tooltips."),
        ("Application Tier (API Gateway)", "Node.js 20.11 LTS, Express 4.19, jsonwebtoken, bcryptjs, cors", "Enforce security boundaries, validate request schemas, execute multi-criteria matching, govern collaboration state transitions."),
        ("Data Persistence Tier (OLTP)", "MySQL 8.0, InnoDB Storage Engine, mysql2 pool", "Ensure ACID transactional consistency, enforce foreign key integrity cascades, execute indexed query plans."),
        ("Analytics & Data Warehouse (OLAP)", "Star Schema, SCD Type 2 dimension tables, SQL Views", "Preserve historical business profile mutations, aggregate procurement liquidity, provide low-latency analytical data."),
        ("Executive Intelligence Tier", "Microsoft Power BI Desktop, DAX Query Engine", "Deliver Apple Analytics-inspired dashboard visualization over platform liquidity, partner trust, and procurement funnels.")
    ]
    add_table_data(doc, ["Architectural Tier", "Technologies & Modules", "Core Operational Responsibilities"], arch_mods, [1.6, 2.2, 2.7])

    add_heading_2(doc, "4.2 Architecture Diagrams (C4 Level 1 & 2)")
    add_p(
        doc,
        "Figure 4.2 presents the Level 1 System Context Diagram based on the C4 architectural modeling standard, illustrating external actors "
        "and primary system interactions:",
        line_spacing=1.2
    )
    
    context_ascii = (
        "       [Business Owner / Partner]                     [Platform Administrator]\n"
        "                    |                                              |\n"
        "                    | Manage Profile, Post Needs,                  | Audit Businesses,\n"
        "                    | Connect, Chat, Collaborate                   | Resolve Reports\n"
        "                    v                                              v\n"
        "      +----------------------------------------------------------------------+\n"
        "      |                     <<System>> BIZLINK PLATFORM                      |\n"
        "      |  A Structured B2B Business Discovery and Collaboration Platform      |\n"
        "      +----------------------------------------------------------------------+\n"
        "                    |                                              |\n"
        "                    | Operational Data Storage                     | Curated SQL Views\n"
        "                    v                                              v\n"
        "      +-----------------------------------+          +-----------------------+\n"
        "      |   MySQL 8.0 Relational Database   |          |  Microsoft Power BI   |\n"
        "      |   16 OLTP Tables + 5 DW Star Tables|          |  Executive Dashboards |\n"
        "      +-----------------------------------+          +-----------------------+"
    )
    add_code_block(doc, context_ascii, font_size=8.0)
    p_cap2 = add_p(doc, "Figure 4.2: System context diagram (Level-1 C4 model)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap2.paragraph_format.keep_with_next = True

    add_heading_2(doc, "4.3 Security Architecture and Trust Boundaries")
    add_p(
        doc,
        "Security is enforced across four discrete trust boundaries to ensure complete defense-in-depth, as modeled in Figure 4.6:",
        line_spacing=1.2
    )
    
    sec_ascii = (
        "[UNTRUSTED ZONE: CLIENT BROWSER]\n"
        "  User Credentials & JWT Token stored in localStorage / Memory\n"
        "  Axios Request Interceptor injects: Authorization: Bearer <JWT>\n"
        "                        |\n"
        "========================|========================== [ZONE BOUNDARY 1: HTTPS / TLS 1.3]\n"
        "                        v\n"
        "[TRUSTED ZONE: EXPRESS API RUNTIME]\n"
        "  1. CORS Origin Whitelist Validation (Reject unauthorized hosts)\n"
        "  2. Rate Limiting & Input Body Schema Sanitization\n"
        "  3. Authentication Guard: Verify HMAC-SHA256 JWT signature; extract user_id & role\n"
        "  4. Membership Guard: Verify caller belongs to target business_id\n"
        "  5. Controller Logic: State machine transition validity checks\n"
        "                        |\n"
        "========================|========================== [ZONE BOUNDARY 2: CONNECTION POOL]\n"
        "                        v\n"
        "[SECURE DATA ZONE: MYSQL 8.0 INNODB ENGINE]\n"
        "  Parameterized Prepared Statements (Zero SQL Injection Vulnerability)\n"
        "  Role-gated CRUD operations & Cascading Foreign-Key Constraints"
    )
    add_code_block(doc, sec_ascii, font_size=8.0)
    p_cap6 = add_p(doc, "Figure 4.6: Security architecture and discrete trust boundaries", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap6.paragraph_format.keep_with_next = True

    add_heading_2(doc, "4.4 Data Flow and Formal Use Case Specifications")
    add_p(
        doc,
        "Figure 4.7 illustrates the Level-1 Data Flow Diagram across system processes, data stores, and external entities:",
        line_spacing=1.2
    )
    
    dfd_ascii = (
        "  [User / Business] --(1. Credentials)-------> [1.0: Auth Service]    --> (D1: users)\n"
        "  [Business Owner]  --(2. Offerings/Needs)---> [2.0: Profile Service] --> (D2: businesses, services, needs)\n"
        "  [Searching User]  --(3. Search Slugs)------> [3.0: Discovery]       <-- (D2: services, needs, categories)\n"
        "                                                     |\n"
        "                                                     v\n"
        "                                               [4.0: Match Engine]   --> (D3: matches)\n"
        "                                                     |\n"
        "  [Connected User]  <--(4. Compatibility Score)------+\n"
        "  [Connected User]  --(5. Connection Request)-> [5.0: Connections]    --> (D4: connections)\n"
        "  [Connected User]  --(6. Message Payload)---> [6.0: Messaging]      --> (D5: messages)\n"
        "  [Collab Partner]  --(7. Contract Proposals)-> [7.0: Collab Engine]  --> (D6: collabs, participants)\n"
        "  [Collab Partner]  --(8. Verified Review)---> [8.0: Review Gate]    --> (D7: reviews)\n"
        "  [Administrator]   --(9. Audit Actions)-----> [9.0: Governance]     --> (D8: reports)"
    )
    add_code_block(doc, dfd_ascii, font_size=8.0)
    p_cap7 = add_p(doc, "Figure 4.7: Level-1 data flow diagram", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap7.paragraph_format.keep_with_next = True

    add_p(
        doc,
        "Table 4.2 presents formal use-case specifications detailing core platform workflows, success guarantees, and failure mitigations:",
        space_before=6, space_after=6, line_spacing=1.2
    )
    uc_rows = [
        ("UC-01", "Register & Onboard Enterprise", "User submits business profile details with category and city; system persists record in 'businesses' with status UNVERIFIED.", "Duplicate slug: system appends random hash or prompts for unique identifier."),
        ("UC-02", "Publish Service Offering", "Owner submits service title, category, and price bounds; system validates positive pricing and saves to 'services'.", "Invalid pricing interval (min > max): rejected with HTTP 400 validation error."),
        ("UC-03", "Post Commercial Need", "Owner submits procurement need with budget boundaries and delivery deadline; system saves record to 'needs'.", "Past deadline entered: rejected with HTTP 400; user prompted for future delivery date."),
        ("UC-04", "Execute Multi-Facet Discovery", "User executes search filtering by keyword, category slug, and city; backend executes optimized SQL join and returns paged results.", "No matching records: system returns empty list with suggested adjacent categories."),
        ("UC-05", "Generate Need-Service Match", "Engine evaluates candidate services against active need, computing taxonomic, budget, geographical, and trust scores.", "Budget gap > 100%: budget score drops to 0.0, total match reflects only taxonomy and location."),
        ("UC-06", "B2B Connection Handshake", "Initiator dispatches connection request; receiver accepts or rejects; status updates atomically in 'connections'.", "Duplicate request: unique constraint on (requester, receiver) prevents duplicate records."),
        ("UC-07", "Direct Business Chat", "Connected users exchange messages within thread; system checks connection status = ACCEPTED before insert.", "Unconnected attempt: rejected with HTTP 403 Forbidden."),
        ("UC-08", "Manage Collaboration Contract", "Partners advance joint project through formal state transitions: DRAFT -> REQUESTED -> NEGOTIATING -> ACCEPTED -> ACTIVE -> COMPLETED.", "Illegal transition attempt: state validator rejects mutation; returns valid next states."),
        ("UC-09", "Submit Verified Review", "Upon reaching COMPLETED status, participant submits 1-5 star rating; system updates review aggregate and business trust index.", "Collaboration uncompleted or review already submitted: rejected with HTTP 400.")
    ]
    add_table_data(doc, ["ID", "Use Case Title", "Primary Success Scenario", "Exception Handling & Boundary Behavior"], uc_rows, [0.8, 1.8, 2.3, 1.6])

    add_heading_2(doc, "4.5 Sequence Diagrams (Connection & Collaboration)")
    add_p(
        doc,
        "Figure 4.9 formalizes the runtime message sequence for establishing a verified B2B connection between two enterprise entities:",
        line_spacing=1.2
    )
    
    conn_seq = (
        "Requester Client         Express API Gateway         connection.service         MySQL Database\n"
        "       |                         |                           |                         |\n"
        "       |--- 1. POST /connections ->|                           |                         |\n"
        "       |    (receiver_id)        |--- 2. Authenticate JWT -->|                         |\n"
        "       |                         |--- 3. Validate Inputs --->|                         |\n"
        "       |                         |                           |--- 4. Check Existing -->|\n"
        "       |                         |                           |<-- 5. No Conflict ------|\n"
        "       |                         |                           |--- 6. INSERT PENDING -->|\n"
        "       |                         |                           |<-- 7. Insert OK --------|\n"
        "       |<-- 8. 201 Created ------|<-- 9. Connection Model ---|\n"
        "       |                         |\n"
        "  [Receiver Logs In]\n"
        "       |--- 10. PUT /connections/:id/accept ---------------->|\n"
        "       |                         |                           |--- 11. UPDATE ACCEPTED->|\n"
        "       |                         |                           |<-- 12. Update OK -------|\n"
        "       |<-- 13. 200 OK (Connected)---------------------------|"
    )
    add_code_block(doc, conn_seq, font_size=8.0)
    p_cap9 = add_p(doc, "Figure 4.9: Sequence diagram: B2B connection request and handshake", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap9.paragraph_format.keep_with_next = True

    add_p(
        doc,
        "Figure 4.10 illustrates the message exchange sequence across the formal collaboration proposal and contract lifecycle:",
        space_before=6, space_after=4, line_spacing=1.2
    )
    collab_seq = (
        "Initiator Business       Partner Business          Express API / State Engine     MySQL Database\n"
        "       |                         |                           |                         |\n"
        "       |--- 1. POST /collaborations (DRAFT) ---------------->|--- 2. INSERT DRAFT ---->|\n"
        "       |--- 3. PUT /collaborations/:id/submit -------------->|--- 4. UPDATE REQUESTED->|\n"
        "       |                         |<-- 5. In-App Notification-|                         |\n"
        "       |                         |--- 6. Negotiate Terms --->|--- 7. UPDATE NEGOTIATING|\n"
        "       |                         |--- 8. Accept Agreement -->|--- 9. UPDATE ACCEPTED ->|\n"
        "       |                         |                           |--- 10. UPDATE ACTIVE -->|\n"
        "       |   [Work Executed]       |                           |                         |\n"
        "       |--- 11. Mark Completed ->|                           |--- 12. UPDATE COMPLETED>|\n"
        "       |                         |<-- 13. Collab Completed --|                         |\n"
        "       |                         |--- 14. POST /reviews ---->|--- 15. INSERT REVIEW -->|\n"
        "       |                         |    (5 Stars, Feedback)    |--- 16. Recalc Rating -->|"
    )
    add_code_block(doc, collab_seq, font_size=8.0)
    p_cap10 = add_p(doc, "Figure 4.10: Sequence diagram: Collaboration proposal and contract machine", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap10.paragraph_format.keep_with_next = True

    add_heading_2(doc, "4.6 Activity and State Diagrams (8-State Automaton)")
    add_p(
        doc,
        "Figure 4.12 formalizes the 8-state finite state automaton governing collaborative contracts. Backend validation strictly enforces "
        "allowed transitions, structurally preventing illegal state progressions (such as transitioning from DRAFT directly to ACTIVE):",
        line_spacing=1.2
    )
    
    state_ascii = (
        "       (*) [Initiator Creates Proposal]\n"
        "        |\n"
        "        v\n"
        "     [DRAFT] -----------> (CANCELLED) ---> (*)\n"
        "        |\n"
        "   submit proposal\n"
        "        v\n"
        "   [REQUESTED] ---------> (DECLINED) ----> (*)\n"
        "        |\n"
        "   counter-offer\n"
        "        v\n"
        "  [NEGOTIATING] --------> (CANCELLED) ---> (*)\n"
        "        |\n"
        "   mutual consent\n"
        "        v\n"
        "   [ACCEPTED]\n"
        "        |\n"
        "   start date reached\n"
        "        v\n"
        "    [ACTIVE] -----------> (CANCELLED) ---> (*)\n"
        "        |\n"
        "   all deliverables approved\n"
        "        v\n"
        "   [COMPLETED] ---------> [Review Privilege Unlocked] ---> (*)"
    )
    add_code_block(doc, state_ascii, font_size=8.0)
    p_cap12 = add_p(doc, "Figure 4.12: State diagram: 8-state collaboration contract lifecycle", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap12.paragraph_format.keep_with_next = True

    add_heading_2(doc, "4.7 Database Schema Design (OLTP 3NF & OLAP Star Schema)")
    add_p(
        doc,
        "The persistence layer is partitioned into two distinct database sub-architectures: a 16-table normalized OLTP schema for transactional "
        "operations and a 5-table OLAP dimensional star schema with Slowly Changing Dimensions (SCD Type 2) for analytics. Table 4.3 details "
        "the entity distribution across operational groups:",
        line_spacing=1.2
    )
    
    db_groups = [
        ("Identity & Access Management", "users", "Registered user credentials, salted bcrypt hashes, global roles (OWNER, PARTNER, ADMIN), active status."),
        ("Taxonomy & Classification", "categories", "Self-referencing hierarchical taxonomy tree storing industry verticals, subcategories, and URL slugs."),
        ("Enterprise Profiles", "businesses", "Corporate entities, legal names, unique slugs, location metadata, descriptions, and verification status."),
        ("Organizational Membership", "business_members", "Composite primary key table (business_id, user_id) mapping users to enterprises with internal roles (ADMIN, STAFF)."),
        ("Commercial Services", "services", "Standardized service offerings with category bindings and pricing boundaries [price_min, price_max]."),
        ("Commercial Procurement Needs", "needs", "Procurement requirements with budget boundaries [budget_min, budget_max], deadlines, and category tags."),
        ("Rule-Based Matches", "matches", "Precomputed compatibility pairings between active needs and candidate services with normalized decimal scores."),
        ("B2B Connections", "connections", "Stateful handshake records between pairs of enterprises with statuses PENDING, ACCEPTED, REJECTED, CANCELLED, BLOCKED."),
        ("Direct Messaging", "messages", "Chronological text messages exchanged between connected enterprises, tracking sender user and business."),
        ("Collaboration Contracts", "collaborations", "Formal joint agreements with 8-stage state tracking, date ranges, and associated need/service bindings."),
        ("Collaboration Participants", "collaboration_participants", "Composite primary key table (collaboration_id, business_id) tracking participant roles (INITIATOR, PARTNER)."),
        ("Verified Reviews", "reviews", "Gated post-collaboration reviews storing 1-5 star ratings, feedback titles, and foreign-key links to completed collaborations."),
        ("Community Feed", "posts", "Commercial announcements and articles authored by verified enterprise members with like count aggregates."),
        ("Post Interactions", "post_interactions", "Fine-grained user interactions on posts, recording LIKE toggles and threaded COMMENT bodies."),
        ("Governance & Moderation", "reports", "System moderation queue recording reported entities (USERS, BUSINESSES, POSTS, REVIEWS), reasons, and resolution states."),
        ("Audit & Activity Logs", "activity_events", "Append-only operational event stream logging significant platform occurrences with JSON metadata payloads.")
    ]
    add_table_data(doc, ["Functional Group", "Primary Tables", "Storage Role & Structural Schema Notes"], db_groups, [1.6, 1.4, 3.5])

    add_heading_2(doc, "4.8 Security, Token Lifecycle and Error-Handling Architecture")
    add_p(
        doc,
        "User sessions are governed by stateless HMAC-SHA256 signed JSON Web Tokens (JWT) configured with a 24-hour expiration window. "
        "The JWT payload embeds user identification (`user_id`), email, and global role claims (`role`), eliminating the need for process-level "
        "session state or distributed session caches (such as Redis) during horizontal scale-out. Passwords are salted and hashed utilizing "
        "bcrypt with 10 rounds of computation. The backend exclusively executes parameterized SQL queries through mysql2 prepared statements, "
        "rendering the application immune to SQL injection attacks (CWE-89). Role-Based Access Control (RBAC) middleware intercepts requests "
        "to protected endpoints, validating that the caller possesses requisite OWNER or ADMIN privileges before dispatching to business controllers.",
        line_spacing=1.2
    )

    doc.add_page_break()

    print("Building Chapter 5: Algorithm Design and Data Structures...")
    # ═══════════════════════════════════════════════════════════════
    # CHAPTER 5: ALGORITHM DESIGN AND DATA STRUCTURES
    # ═══════════════════════════════════════════════════════════════
    add_heading_1(doc, "CHAPTER 5: ALGORITHM DESIGN AND DATA STRUCTURES")
    
    add_heading_2(doc, "5.1 Multi-Criteria Matching Engine Formulation")
    add_p(
        doc,
        "BizLink introduces a deterministic, explainable multi-criteria compatibility formulation that quantifies the degree of operational "
        "fit between an active procurement need $N$ and a candidate commercial service $S$. Rather than relying on uninterpretable neural "
        "embeddings, the matching engine decomposes compatibility into four distinct, verifiable dimensions:\n"
        "1. Taxonomic Category Match ($S_{cat}$): Measures vertical domain alignment based on exact category equality or hierarchical depth.\n"
        "2. Budget-Price Interval Overlap ($S_{budget}$): Computes the normalized intersection between the buyer's budget span $[B_{min}, B_{max}]$ "
        "and the supplier's price range $[P_{min}, P_{max}]$.\n"
        "3. Geographic Proximity ($S_{geo}$): Assesses logistical convenience based on city matching.\n"
        "4. Verified Trust Index ($S_{trust}$): Blends the enterprise's official verification status ($V \\in \\{0.5, 1.0\\}$) and historical 5-star rating ($R \\in [0, 5]$).",
        line_spacing=1.2
    )
    add_p(
        doc,
        "The composite compatibility score $S_{total}$ is defined as the weighted linear combination of the component scores:\n\n"
        "    S_total = w_1 · S_cat + w_2 · S_budget + w_3 · S_geo + w_4 · S_trust              (Equation 5.1)\n\n"
        "where the empirically calibrated weight coefficients are:\n"
        "    w_1 = 0.35 (Taxonomy),  w_2 = 0.25 (Budget),  w_3 = 0.20 (Geography),  w_4 = 0.20 (Trust)\n"
        "satisfying the normalization condition: ∑ w_i = 1.00.",
        space_before=4, space_after=8, line_spacing=1.2
    )
    add_p(
        doc,
        "The budget compatibility factor $S_{budget}$ is calculated via bounded interval intersection arithmetic:\n\n"
        "    Overlap = max(0, min(B_max, P_max) - max(B_min, P_min))                           (Equation 5.2)\n"
        "    TotalSpan = max(B_max, P_max) - min(B_min, P_min)                                (Equation 5.3)\n"
        "    S_budget = Overlap / TotalSpan  (if TotalSpan > 0, else 1.0)                      (Equation 5.4)\n\n"
        "If no overlap exists (Overlap = 0), a smooth linear penalty decays the score based on the relative gap distance, ensuring that "
        "near-matches are not entirely discarded.",
        space_before=4, space_after=8, line_spacing=1.2
    )
    add_p(
        doc,
        "The verified trust score $S_{trust}$ is formulated as:\n\n"
        "    S_trust = 0.50 · V_status + 0.50 · (Rating / 5.0)                                 (Equation 5.5)\n\n"
        "where V_status = 1.0 for officially VERIFIED enterprises, and V_status = 0.5 for UNVERIFIED entities. Enterprises with zero prior "
        "reviews are assigned an unbiased baseline rating of 3.0 / 5.0, preventing cold-start starvation while rewarding verified performance.",
        space_before=4, space_after=8, line_spacing=1.2
    )

    add_heading_2(doc, "5.2 Algorithmic Flow and Execution Pipeline")
    add_p(
        doc,
        "Figure 5.1 illustrates the complete execution pipeline of the explainable matching engine from initial procurement requirement input "
        "to ranked candidate delivery:",
        line_spacing=1.2
    )
    
    match_flow = (
        "[Input: Need ID (C_need, B_min, B_max, City_need)]\n"
        "        |\n"
        "        v\n"
        "[Step 1: SQL Candidate Pre-Filtering via Indexed Category & Active Status]\n"
        "        |\n"
        "        v\n"
        "[Step 2: Retrieve Top-50 Candidate Services with Parent Business & Trust Metadata]\n"
        "        |\n"
        "        v\n"
        "[Step 3: In-Memory Multi-Criteria Evaluation]\n"
        "   • Category Match: S_cat = (C_need == C_serv) ? 1.0 : (Hierarchy Distance)\n"
        "   • Budget Overlap: S_budget = Overlap(Need, Service) / TotalSpan\n"
        "   • Geographic Proximity: S_geo = (City_need == City_serv) ? 1.0 : 0.4\n"
        "   • Trust Metric: S_trust = 0.5 · V_status + 0.5 · (Rating / 5.0)\n"
        "        |\n"
        "        v\n"
        "[Step 4: Composite Score Computation: S_total = ∑ w_i · S_i]\n"
        "        |\n"
        "        v\n"
        "[Step 5: Descending QuickSort Ranking & Explainable Tooltip Payload Assembly]\n"
        "        |\n"
        "        v\n"
        "[Output: Paginated JSON Response with Match Scores & Breakdown Factors]"
    )
    add_code_block(doc, match_flow, font_size=8.0)
    p_cap_flow = add_p(doc, "Figure 5.1: Multi-criteria matching engine execution pipeline", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, font_size=10)
    p_cap_flow.paragraph_format.keep_with_next = True

    add_heading_2(doc, "5.3 Data Structures and Space/Time Complexity")
    add_p(
        doc,
        "Table 5.1, Table 5.2, and Table 5.3 detail the primary data structures, architectural trade-offs, and asymptotic complexity bounds "
        "governing BizLink's computational routines:",
        line_spacing=1.2
    )
    
    ds_rows = [
        ("B-Tree Indexes", "MySQL InnoDB primary (PK) and foreign key (FK) index structures.", "O(log N) lookup time for category pre-filtering, user authorization, and connection checks."),
        ("Hash Maps / In-Memory Dicts", "Node.js key-value lookups for state validation matrices and category trees.", "O(1) average lookup time for transition validation and role permission checks."),
        ("Interval Tuples", "[min_val, max_val] continuous numerical price and budget intervals.", "O(1) time interval intersection arithmetic for budget compatibility computation."),
        ("Weighted Score Vectors", "Floating-point arrays [S_cat, S_budget, S_geo, S_trust] normalized in [0.0, 1.0].", "O(1) vector dot product with pre-calibrated weight coefficients [0.35, 0.25, 0.20, 0.20]."),
        ("Array Slices / Ring Buffers", "Recent chronological message timelines and activity event feeds.", "O(K) memory where K is the pagination window size (typically 20 records).")
    ]
    add_table_data(doc, ["Algorithmic Data Structure", "Concrete Implementation in BizLink", "Computational Characteristics & Access Latency"], ds_rows, [1.8, 2.3, 2.4])

    trade_rows = [
        ("Deterministic Multi-Criteria vs. Deep Neural Net", "Rule-based 4-factor scoring was selected over opaque embeddings to provide mathematical explainability and zero training overhead.", "Eliminates black-box opacity; delivers transparent tooltips explaining exact score factors to users."),
        ("Precomputed vs. On-Demand Matching", "On-demand calculation over SQL pre-filtered candidates was chosen over batch precomputation.", "Guarantees real-time accuracy as prices or ratings update, avoiding stale match caches."),
        ("In-Memory State Matrix vs. DB Status Flags", "Static in-memory JavaScript transition matrix was selected for state validation before SQL mutation.", "Prevents invalid database round-trips; returns instant HTTP 400 with valid transition lists.")
    ]
    add_table_data(doc, ["Design Choice", "Engineering Rationale & Alternatives Considered", "Practical System Impact"], trade_rows, [1.8, 2.5, 2.2])

    comp_rows = [
        ("Multi-Criteria Match Scoring", "O(M · log M), where M is candidate pool (M <= 50)", "O(M) for candidate score vectors", "Database pre-filtering limits M <= 50; execution takes < 15 ms."),
        ("B2B Connection Handshake", "O(log N) via indexed (requester_id, receiver_id)", "O(1) single row memory", "Indexed unique constraint guarantees instant conflict detection."),
        ("State Machine Transition Validation", "O(1) hash map lookup against valid next states", "O(1) static transition matrix", "Instant rejection of invalid state mutation requests."),
        ("Verified Review Submission & Recalculation", "O(1) atomic SQL update of running rating", "O(1) transaction context", "Running sum and count update avoids full review table scans.")
    ]
    add_table_data(doc, ["Computational Routine", "Time Complexity", "Space Complexity", "Operational Characteristics"], comp_rows, [1.8, 1.8, 1.4, 1.5])

    add_heading_2(doc, "5.4 Algorithmic Invariants and Correctness Proofs")
    add_p(
        doc,
        "The system enforces three formal algorithmic invariants:\n"
        "1. Score Boundedness: For all valid inputs, each component score S_i in [0.0, 1.0]. Because sum(w_i) = 1.0, the total score S_total "
        "is strictly bounded in [0.0, 1.0].\n"
        "2. Deterministic State Progression: Terminal contract states (COMPLETED, DECLINED, CANCELLED) have zero valid outgoing transitions, preventing "
        "cyclic re-execution or illegal status resurrection.\n"
        "3. Review Integrity Invariant: Reviews require collaboration status == COMPLETED and verified membership, structurally barring fabricated ratings.",
        line_spacing=1.2
    )

    doc.add_page_break()
    print("Chapters 4 and 5 completed successfully.")

