# BizLink Product Requirements Document --- 09 Roadmap, Traceability and Deployment

> **Document Group:** Sections 69--73, 72A, 72B, 72C, 75--75A, 79--81\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final
> **Dependency:** This document is the final
> implementation/orchestration layer over `00-overview.md` through
> `08-testing-quality-and-operations.md`.

------------------------------------------------------------------------

# 69. Implementation Roadmap

The implementation roadmap establishes the overall sequencing and points
to the detailed build-phasing and orchestration rules in Sections 72A
through 72C.

------------------------------------------------------------------------


# 70. Implementation Scope and Priorities

## 70.1 MVP Core

The MVP priority sequence is:

1.  identity and access;
2.  business membership;
3.  business profiles;
4.  services/offers;
5.  needs;
6.  discovery;
7.  rule-based matching;
8.  connections;
9.  messaging;
10. collaborations;
11. reviews/trust;
12. posts/opportunities;
13. administration;
14. current-state analytics;
15. Power BI.

## 70.2 Scope Discipline

Do not introduce:

-   Kafka;
-   Talend;
-   Excel-based data pipelines;
-   a separate ETL platform;
-   a separate data warehouse;
-   AI/ML matching;

into the current architecture without an explicit approved scope change.

## 70.3 Future Enhancements

Potential future capabilities include:

-   semantic matching;
-   natural-language search;
-   intelligent recommendations;
-   AI-generated insights;
-   additional integrations;
-   additional analytics;
-   mobile applications.

Future scope must not destabilize the current MVP architecture.

------------------------------------------------------------------------

# 71. Repository and Implementation Structure

The implementation repository should use:

``` text
BizLink/
├── frontend/
├── backend/
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── views/
│   └── schema/
├── docs/
│   └── prd/
├── tests/
├── scripts/
├── .env.example
└── README.md
```

## 71.1 Frontend

The frontend structure is defined in `02-frontend.md`.

## 71.2 Backend

The backend structure is defined in `03-backend-and-api.md`.

## 71.3 Database

The database structure is defined in `04-database.md`.

## 71.4 Documentation

The PRD remains under:

``` text
docs/prd/
```

The README is generated only after all content files and final quality
checks are complete.

## 71.5 Test Structure

Tests may be organized by:

``` text
tests/
├── unit/
├── api/
├── integration/
├── e2e/
├── security/
├── database/
└── analytics/
```

The exact framework is a **Recommended Design Decision** unless
specified elsewhere.

------------------------------------------------------------------------

# 72A. Build Phasing

## 72A.1 Build Order

BizLink must be implemented in strict gated layers:

``` text
Layer 1 — Database
       ↓
Human Approval
       ↓
Layer 2 — Backend
       ↓
Human Approval
       ↓
Layer 3 — Frontend
       ↓
Human Approval
       ↓
Final Power BI
       ↓
Final Validation / Release
```

No layer may silently begin before the previous layer has passed its
verification gate and the required human approval has been obtained.

## 72A.2 Layer 1 --- Database

### Objective

Create the complete relational foundation before application-layer
implementation.

### Required Outputs

``` text
database/
├── migrations/
├── seeds/
├── views/
└── schema/
```

The database layer must include:

-   operational schema;
-   primary/foreign keys;
-   unique constraints;
-   required indexes;
-   migrations;
-   deterministic seeds;
-   transactions;
-   required reporting structures;
-   justified SCD Type 2 structures;
-   database tests.

### Gate

The Database Gate defined in `08-testing-quality-and-operations.md` must
pass before Layer 2 starts.

## 72A.3 Layer 2 --- Backend

### Objective

Build the complete REST API and backend business logic against the
gate-passed database.

### Required Outputs

-   Express application;
-   `/api/v1/` routes;
-   authentication;
-   authorization;
-   validation;
-   controllers;
-   services;
-   repositories;
-   database access;
-   standardized errors;
-   logging;
-   security controls;
-   backend tests.

### Gate

The Backend Gate must pass before Layer 3 starts.

## 72A.4 Layer 3 --- Frontend

### Objective

Build the complete React/Vite/Tailwind application against the
gate-passed API contracts.

### Required Outputs

-   application shell;
-   routes;
-   pages;
-   reusable components;
-   forms;
-   discovery;
-   business profiles;
-   connections;
-   messaging;
-   collaborations;
-   reviews;
-   administration;
-   responsive behavior;
-   accessibility;
-   frontend tests;
-   E2E workflows.

### Gate

The Frontend Gate must pass before Power BI begins.

## 72A.5 Final Power BI Layer

Power BI is implemented only after:

1.  database gate;
2.  backend gate;
3.  frontend gate;
4.  required human approvals.

Power BI uses curated current-state reporting structures and excludes
SCD2/history/audit-only structures.

------------------------------------------------------------------------

# 72A.6 Agent Workstream Definition

## 72A.6.1 Backend Workstreams

After the backend foundation passes its internal setup check, work may
be parallelized across:

### Track 1 --- Foundation / Authentication

Scope:

-   Express setup;
-   configuration;
-   DB connectivity;
-   authentication;
-   authorization;
-   shared middleware;
-   validation foundation.

### Track 2 --- Business Profiles / Services / Needs

Scope:

-   users/businesses;
-   business membership;
-   profiles;
-   categories;
-   services;
-   needs.

### Track 3 --- Discovery / Rule-Based Matching

Scope:

-   discovery APIs;
-   filters;
-   pagination;
-   matching rules;
-   match explanations.

### Track 4 --- Connections / Messaging

Scope:

-   connection lifecycle;
-   relationship authorization;
-   conversations;
-   messages;
-   unread/read behavior.

### Track 5 --- Collaborations / Reviews / Trust / Admin

Scope:

-   collaboration lifecycle;
-   participants;
-   completion;
-   reviews;
-   verification;
-   reports;
-   moderation;
-   administrative operations.

### Track 6 --- Power BI-Adjacent Analytics

Scope:

-   reporting queries;
-   current-state views;
-   analytics data contracts;
-   reporting validation helpers.

Power BI itself remains gated until after Layer 3.

## 72A.6.2 Frontend Workstreams

After the frontend shell, routing, authentication context, API client,
and design-system foundation are stable, work may be parallelized across
the same six product areas:

1.  Foundation/Auth
2.  Business Profiles/Services/Needs
3.  Discovery/Matching
4.  Connections/Messaging
5.  Collaborations/Reviews/Trust/Admin
6.  Analytics-adjacent UI

## 72A.6.3 Database Workstream

Database work should default to a single tightly coordinated workstream
because schema dependencies are broad.

If parallel DB work is necessary, ownership must be explicit and no two
agents may concurrently alter the same migration/schema file.

------------------------------------------------------------------------

# 72B. Orchestration Strategy

## 72B.1 Layer Ownership

The coding agent must maintain clear ownership of:

-   database files;
-   backend files;
-   frontend files;
-   tests;
-   documentation;
-   deployment configuration.

Concurrent agents must never edit the same file simultaneously.

## 72B.2 Shared Foundation Before Parallel Work

Parallel work may begin only after the shared layer foundation is
established.

For example:

``` text
Layer 2
   ↓
Shared backend foundation
   ↓
Parallel feature tracks
```

not:

``` text
Six agents independently invent backend foundations
```

The same principle applies to Layer 3.

------------------------------------------------------------------------

## 72B.3 Orchestration Rules

### 72B.3.1 Strict Layer Sequencing

The layer sequence is immutable unless a human-approved architecture
change explicitly changes it.

``` text
DATABASE
  ↓
BACKEND
  ↓
FRONTEND
  ↓
POWER BI
```

No cross-layer parallelization is permitted.

### 72B.3.2 Shared Contract First

Before feature agents begin, the layer lead must establish the shared
contracts.

### Backend Shared Contract

Includes:

-   API versioning;
-   error envelope;
-   authentication middleware;
-   authorization middleware;
-   validation strategy;
-   DB access pattern;
-   logging;
-   configuration.

### Frontend Shared Contract

Includes:

-   routing;
-   authentication state;
-   API client;
-   design tokens;
-   shared components;
-   error/loading/empty states;
-   accessibility conventions.

### 72B.3.3 File Ownership

Each parallel track receives a file/module ownership map.

An agent must not modify another agent's owned file without explicit
coordination.

### 72B.3.4 Dependency Handling

If Track B depends on Track A:

``` text
Track A completes shared dependency
       ↓
Track A reports interface
       ↓
Track B integrates
```

Do not solve cross-track dependency by independently implementing
conflicting versions.

### 72B.3.5 Integration Checkpoint

Before a layer can pass its gate:

1.  merge/integrate work;
2.  resolve conflicts;
3.  run unit tests;
4.  run integration/API tests;
5.  run security checks;
6.  run relevant E2E checks;
7.  verify cross-feature contracts;
8.  document unresolved issues.

------------------------------------------------------------------------

# 72C. Human Approval Checkpoints

## 72C.1 Mandatory Approval

Human approval is required:

-   after Database Layer completion;
-   after Backend Layer completion;
-   after Frontend Layer completion;
-   before Power BI;
-   before major architecture/schema changes.

An agent must not assume approval.

## 72C.2 Gate Report

At every boundary, the agent must report:

1.  what was built;
2.  tests executed;
3.  tests passed/failed;
4.  unresolved issues;
5.  assumptions;
6.  Recommended Design Decisions;
7.  schema changes;
8.  deviations from PRD;
9.  known risks;
10. files/modules changed.

## 72C.3 Stop Condition

After the gate report:

``` text
WAIT FOR EXPLICIT HUMAN APPROVAL
```

The agent must not continue into the next layer automatically.

## 72C.4 Major Change Approval

A major change includes, at minimum:

-   changing database semantics;
-   renaming a core entity;
-   removing a required feature;
-   changing authentication architecture;
-   changing API contract in a breaking manner;
-   introducing a new infrastructure platform;
-   changing the Power BI data boundary;
-   introducing AI/ML into current matching.

Such a change requires explicit approval and updated traceability.

------------------------------------------------------------------------

# 73. Schema Freeze

## 73.1 Freeze Point

After Layer 1 passes its gate, the operational schema is considered
frozen.

## 73.2 Allowed Changes

After freeze, changes should be additive where possible:

-   new tables;
-   new nullable columns;
-   safe-default columns;
-   additive indexes;
-   non-breaking reporting views.

## 73.3 Restricted Changes

Breaking schema changes are explicitly forbidden by default after the
freeze point. This includes silently or routinely making any change that
renames core tables, drops columns, changes column semantics, changes
primary keys, breaks foreign keys, changes status meanings, or
restructures relationships.

A breaking change may proceed **only** through the Section 72C.4 Major
Change Approval process as a rare, explicitly approved exception. This
is an exception process, not a routine escalation path or a standing
option for post-freeze development.

## 73.4 Schema Change Process

``` text
Need identified
   ↓
Determine whether additive/non-breaking change is possible
   ↓
If breaking: Section 72C.4 Major Change Approval (rare exception only)
   ↓
Impact analysis
   ↓
PRD / contract impact
   ↓
Explicit human approval
   ↓
Migration
   ↓
Regression tests
   ↓
Updated documentation
```

------------------------------------------------------------------------

# 75. Deployment Architecture

## 75.1 Application Deployment

The current application can be deployed using:

``` text
Client Browser
     ↓
Frontend Hosting / CDN
     ↓
React/Vite Application
     ↓
Backend Hosting
     ↓
Node.js / Express
     ↓
MySQL
```

Cloudflare/CDN and AWS are optional infrastructure choices within the
current architecture.

## 75.2 Database

MySQL must be deployed with:

-   restricted network access;
-   application credentials with least privilege;
-   backups;
-   migration process;
-   monitoring;
-   recovery process.

## 75.3 Object Storage

If large files are required, AWS S3 or equivalent object storage may be
used.

Object storage is optional and must not be introduced if the implemented
product has no file-storage requirement.

## 75.4 Environment Separation

Maintain separate configuration for:

-   development;
-   test;
-   production.

Never reuse development secrets in production.

------------------------------------------------------------------------

# 75A. Deployment Configuration

## 75A.1 Required Configuration Categories

The deployment configuration must support:

-   frontend environment;
-   backend environment;
-   database connection;
-   JWT configuration;
-   CORS;
-   object storage where used;
-   logging;
-   Power BI/reporting configuration where needed.

## 75A.2 Secrets

Secrets must not be committed.

Use:

``` text
.env
```

or an appropriate deployment secret-management mechanism.

Commit only:

``` text
.env.example
```

with safe placeholders.

## 75A.3 Health and Readiness

Deployment should provide a health/readiness strategy capable of
identifying:

-   application availability;
-   database dependency availability;
-   startup/configuration failures.

Health responses must not reveal secrets or internal infrastructure
details.

------------------------------------------------------------------------

# 79. Final Traceability Requirements

## 79.1 Requirement Traceability

Every important requirement must trace through:

``` text
Requirement ID
     ↓
Feature / Workflow
     ↓
Frontend
     ↓
API
     ↓
Backend
     ↓
Database
     ↓
Security
     ↓
Test
     ↓
Acceptance
```

For analytics requirements:

``` text
Requirement
     ↓
Reporting Structure
     ↓
KPI
     ↓
Power BI Visual
     ↓
Validation
```

## 79.2 Traceability IDs

Maintain stable identifiers such as:

``` text
FR-*
NFR-*
DB-*
API-*
UI-*
TC-*
```

Do not casually rename identifiers because another document references
them.

## 79.3 Change Traceability

A change to a requirement must trigger an impact review of:

-   related frontend;
-   API;
-   backend;
-   database;
-   security;
-   tests;
-   analytics;
-   deployment.

------------------------------------------------------------------------

# 80. Final Quality Review

Before final completion, review:

## Architecture

-   [ ] React/Vite/Tailwind used for frontend
-   [ ] Node/Express used for backend
-   [ ] REST API used
-   [ ] `/api/v1/` used
-   [ ] `mysql2` used
-   [ ] MySQL used
-   [ ] React does not connect directly to MySQL
-   [ ] business logic separated from route handlers

## Authentication and Security

-   [ ] JWT implemented
-   [ ] bcrypt implemented
-   [ ] no reversible password storage
-   [ ] authentication and authorization distinguished
-   [ ] business-level authorization enforced
-   [ ] validation implemented
-   [ ] SQL injection protections implemented
-   [ ] XSS protections addressed
-   [ ] CORS configured
-   [ ] rate limiting addressed
-   [ ] secrets externalized
-   [ ] sensitive logging prohibited

## Product

-   [ ] business profiles
-   [ ] services/offers
-   [ ] needs
-   [ ] search/filter/discovery
-   [ ] rule-based matching
-   [ ] explainable matches
-   [ ] connections
-   [ ] messaging
-   [ ] collaborations
-   [ ] collaboration history
-   [ ] reviews
-   [ ] verification/trust
-   [ ] posts/opportunities/requirements
-   [ ] reports
-   [ ] administration

## Database

-   [ ] operational entities represented
-   [ ] foreign keys
-   [ ] unique constraints
-   [ ] indexes
-   [ ] transactions
-   [ ] deterministic seeds
-   [ ] required demo scenarios
-   [ ] SCD2 only where justified
-   [ ] SCD2 current-row integrity
-   [ ] reporting structures separated from operational logic

## Analytics

-   [ ] MySQL → curated current-state reporting
-   [ ] Power BI required
-   [ ] SCD2/history excluded
-   [ ] KPI definitions traceable
-   [ ] cross-filtering/cross-highlighting preserved
-   [ ] secure Power BI Service publication
-   [ ] no unsupported KPI

## UX

-   [ ] professional business-oriented UI
-   [ ] responsive
-   [ ] keyboard accessible
-   [ ] semantic HTML
-   [ ] screen-reader labels
-   [ ] accessible errors
-   [ ] loading states
-   [ ] empty states
-   [ ] error states
-   [ ] WCAG 2.1 AA target

## Testing

-   [ ] unit
-   [ ] API
-   [ ] integration
-   [ ] database
-   [ ] auth/authz
-   [ ] frontend
-   [ ] E2E
-   [ ] security
-   [ ] analytics/Power BI validation

## Process

-   [ ] database gate passed
-   [ ] human approval obtained
-   [ ] backend gate passed
-   [ ] human approval obtained
-   [ ] frontend gate passed
-   [ ] human approval obtained
-   [ ] Power BI completed
-   [ ] final documentation synchronized

------------------------------------------------------------------------

# 81. Final Architecture Consistency Check

The final architecture must remain:

``` text
Business Users
      ↓
React.js + Vite + Tailwind CSS
      ↓
REST APIs /api/v1/
      ↓
Node.js + Express.js
      ↓
Authentication
      ↓
Authorization
      ↓
Validation
      ↓
Business Logic
      ↓
mysql2
      ↓
MySQL
      ├── Operational Data
      ├── Selective SCD Type 2 History / Audit
      └── Curated CURRENT-STATE Reporting
                    ↓
                 Power BI
```

Final consistency requirements:

1.  React/Vite/Tailwind is the frontend.
2.  Node/Express is the backend.
3.  REST APIs use `/api/v1/`.
4.  `mysql2` connects the backend to MySQL.
5.  React never connects directly to MySQL.
6.  Authentication uses JWT.
7.  Passwords use bcrypt.
8.  Authentication and authorization are distinct.
9.  Business-level authorization is enforced.
10. Input validation is enforced.
11. SQL injection is prevented through parameterized queries.
12. Current matching is rule-based and explainable.
13. AI/ML matching remains future scope.
14. Power BI consumes curated current-state reporting structures.
15. SCD Type 2/history/audit-only structures are excluded from Power BI.
16. Kafka, Talend, Excel, separate ETL, and separate data warehouse are
    not part of the current architecture.
17. SCD Type 2 is used only where justified.
18. Business profiles, trust, connections, messaging, collaborations,
    reviews, and administration remain first-class product capabilities.
19. UX remains simple, professional, responsive, and accessible.
20. Layer sequencing remains Database → Backend → Frontend → Power BI.
21. Human approval is required at every layer boundary.
22. Schema freeze applies after the Database Gate.
23. README is generated only after all content files and final checks
    pass.

If an implementation artifact violates one of these checks, it must be
treated as a deviation requiring resolution rather than silently
accepted.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [02 --- Frontend](./02-frontend.md)
-   [03 --- Backend and API](./03-backend-and-api.md)
-   [04 --- Database](./04-database.md)
-   [05 --- Security](./05-security.md)
-   [06 --- Features and Workflows](./06-features-and-workflows.md)
-   [07 --- Power BI and Analytics](./07-powerbi-and-analytics.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
