# BizLink Product Requirements Document --- 00 Overview

> **Document Group:** Sections 1--12 + Section 1A\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final
> **Authoritative source:**
> `BizLink_Master_PRD__Antigravity_Prompt_v9.md`

------------------------------------------------------------------------

## 1. Critical AI Coding Agent Context

### 1.1 Purpose of This PRD

BizLink is being specified as a real product and engineering system
rather than as a conceptual academic exercise. The PRD is the contract
that the coding agent will use to create the repository, application
layers, database, APIs, security controls, tests, deployment
configuration, documentation, and analytics implementation.

The PRD therefore specifies requirements, architecture, interfaces,
contracts, schemas, workflows, validation rules, permissions, database
behavior, security behavior, testing requirements, acceptance criteria,
file/module responsibilities, and implementation constraints. It
intentionally does **not** contain thousands of lines of production
source code.

The intended implementation flow is:

``` text
PRD
  ↓
Coding Agent
  ↓
Actual Codebase
  ↓
Automated Tests
  ↓
Debugging / Refinement
  ↓
Production-Ready BizLink
```

The implementation must be derived from the specification rather than
requiring the coding agent to guess product behavior.

### 1.2 Shared Context Requirement

Every coding or orchestration agent must read this overview, including
the Section 1A Build Narrative, before planning, generating files,
modifying the repository, or implementing its assigned slice. The
overview establishes the shared product and architectural mental model;
the deeper section-group files provide the detailed contracts.

------------------------------------------------------------------------

# 1A. Build Narrative --- Agent Context Story

Businesses routinely need customers, suppliers, service providers,
vendors, consultants, partners, and collaborators outside their
immediate personal networks. Traditional discovery often depends on
friends, family, referrals, word-of-mouth, and existing professional
relationships. That approach can work, but it also creates a structural
limitation: a business may know what it needs without having a
structured way to discover and evaluate businesses capable of providing
it.

BizLink exists to make that discovery process more structured.

A business creates a professional presence, explains who it is,
describes what it offers, records what it needs, and indicates the kinds
of collaboration it is open to. Other businesses can then discover it
through structured search and filtering, evaluate its profile and trust
evidence, identify relevant matches, initiate a connection, communicate
through the platform, and move into a collaboration. The product's
central journey is therefore:

``` text
DISCOVER → EVALUATE → CONNECT → COLLABORATE
```

The objective is not to reproduce a generic social network. BizLink is a
structured B2B discovery, evaluation, connection, and collaboration
platform. The intended transformation is from **"I know a guy."** toward
**"I found the right business."**

The application is constructed in a deliberately gated sequence. First,
the complete database layer is established. This includes the
operational schema, constraints, indexes, migrations, deterministic seed
framework, curated reporting structures, and required historical/SCD
Type 2 structures. The database must pass its verification gate and its
feature-by-feature schema cross-check before backend implementation
begins. The authoritative detailed database specification is
[`04-database.md`](./04-database.md).

Second, the complete backend is built on the gate-passed database. The
backend provides the REST API, authentication, authorization,
validation, business logic, data access, error handling, security
controls, and backend tests. Its authoritative detailed specification is
[`03-backend-and-api.md`](./03-backend-and-api.md).

Third, the complete frontend is built against the gate-passed backend
API contracts. React, Vite, and Tailwind CSS provide the application
interface, navigation, business workflows, discovery experience,
messaging, collaboration workflows, administration, and accessible user
experience. Its authoritative detailed specification is
[`02-frontend.md`](./02-frontend.md).

Only after the application layers have passed their gates and the
required human approval checkpoint has been satisfied is the final Power
BI implementation performed. Power BI consumes curated current-state
MySQL reporting structures. Historical/SCD Type 2 structures remain
database-only historical/audit structures and are explicitly excluded
from the Power BI model. The authoritative analytics specification is
[`07-powerbi-and-analytics.md`](./07-powerbi-and-analytics.md).

Antigravity can orchestrate multiple agents. That capability is used to
parallelize work **within** a layer after that layer's shared foundation
is established. The layers themselves remain strictly sequential and
hard-gated. The full orchestration strategy is defined in Section 72B
and the human approval mechanism is defined in Section 72C.

Human approval is required at every layer boundary and before major
changes. A layer passing its own verification does not authorize
automatic progression to the next layer. The agent must report what was
built, what was verified, unresolved issues, assumptions, Recommended
Design Decisions, additive schema changes, and deviations, then wait for
explicit approval. This mechanism is defined in Section 72C.

This narrative is a shared context story, not a replacement for the
deeper specifications. An agent should use it to understand the entire
system and then open the authoritative file for the layer or feature it
is assigned.

------------------------------------------------------------------------

# 2. Source Material --- Primary Source of Truth

The master prompt identifies three intended primary source materials:

1.  BizLink Project Abstract
2.  Finalized BizLink System Architecture
3.  BizLink Relational Database / ER Schema in draw.io XML

The supplied master prompt is available in the current working context.
**Assumption:** the separate Project Abstract, Finalized System
Architecture artifact, and draw.io ER XML are not separately available
in this generation workspace. Therefore this PRD batch does not invent
schema fields, relationships, or architecture details that those
artifacts would uniquely determine.

When those source artifacts are available, they must be treated
according to the mandatory precedence rule:

1.  **ER Schema / draw.io XML** --- database structure.
2.  **Finalized System Architecture** --- module/layer boundaries and
    connectivity.
3.  **Project Abstract** --- product scope, terminology, intent, and
    current/future scope.
4.  Remaining unresolved conflicts --- explicitly document as a
    **Recommended Design Decision**.

Where the source materials do not specify a point, this PRD uses one of
the required labels:

-   **Recommended Design Decision**
-   **Proposed Requirement**
-   **Assumption**
-   **Future Enhancement**

No assumption in this file should be treated as an already-implemented
fact.

------------------------------------------------------------------------

# 3. Current Product Definition

BizLink is a web-based B2B networking, business discovery, and
collaboration platform designed primarily for business owners and
business representatives.

The platform addresses the discovery limitation created by dependence
on:

-   friends and family;
-   personal contacts;
-   referrals;
-   word-of-mouth;
-   existing professional networks.

Businesses use BizLink to find or evaluate:

-   customers;
-   suppliers;
-   service providers;
-   partners;
-   consultants;
-   vendors;
-   collaborators.

The core workflow is:

``` text
DISCOVER
   ↓
EVALUATE
   ↓
CONNECT
   ↓
COLLABORATE
```

The product enables businesses to:

-   create professional business profiles;
-   showcase products and services;
-   state what they **OFFER**;
-   state what they **NEED**;
-   discover relevant businesses;
-   search and filter businesses;
-   evaluate business credibility;
-   identify potential matches;
-   initiate connections;
-   communicate through in-app messaging;
-   post business requirements and opportunities;
-   initiate collaborations;
-   maintain collaboration history;
-   review other businesses;
-   build credibility through verification, certifications,
    achievements, and reviews.

BizLink must not become a generic social-media clone. Structured B2B
discovery and relationship formation remain the central product value.

------------------------------------------------------------------------

# 4. Product Positioning

BizLink should not be defined merely as "LinkedIn for businesses." That
phrase can serve as an intuitive high-level reference, but it is not the
product definition.

The product is:

> **A structured B2B discovery, evaluation, connection, and
> collaboration platform where businesses explicitly define who they
> are, what they offer, what they need, and what kinds of collaboration
> they are open to.**

The product should help transform:

> **"I know a guy."**

into:

> **"I found the right business."**

The PRD does not claim that BizLink is the first or only product solving
business networking or discovery.

------------------------------------------------------------------------

# 5. Product Philosophy

BizLink should feel useful to real business owners. The intended product
qualities are:

-   professional;
-   credible;
-   business-oriented;
-   trustworthy;
-   efficient;
-   simple;
-   responsive;
-   scalable;
-   modern;
-   practical.

The interface must not feel like:

-   a student project;
-   a flashy social-media application;
-   a gaming platform;
-   a decorative startup landing page;
-   a generic SaaS template;
-   an entertainment application.

The visual language should be:

-   subtle;
-   restrained;
-   professional;
-   business-focused;
-   industry-standard;
-   readable;
-   information-oriented.

Use:

-   clean typography;
-   sensible spacing;
-   restrained colors;
-   clear hierarchy;
-   professional cards;
-   tables where appropriate;
-   useful icons;
-   consistent controls;
-   meaningful whitespace;
-   responsive layouts.

Avoid:

-   excessive gradients;
-   excessive animation;
-   unnecessary illustrations;
-   decorative noise;
-   complicated interactions;
-   overly dense dashboards.

Every major feature should answer:

> **What useful business task does this help the user complete?**

Technical possibility alone is not sufficient justification for adding
complexity.

------------------------------------------------------------------------

# 6. Current Technology Stack

  Layer / Concern           Current Technology
  ------------------------- ----------------------
  Frontend                  React.js
  Build tool                Vite
  Styling                   Tailwind CSS
  API                       RESTful APIs
  Backend                   Node.js + Express.js
  Database driver           mysql2
  Database                  MySQL / SQL
  Authentication            JWT
  Password hashing          bcrypt
  Development               Visual Studio Code
  Version control           Git / GitHub
  API testing               Postman
  Analytics                 Microsoft Power BI
  Optional infrastructure   Cloudflare / CDN
  Optional hosting          AWS
  Optional object storage   AWS S3

The current architecture does **not** include:

-   Apache Kafka;
-   Talend;
-   Microsoft Excel;
-   a separate ETL platform;
-   a separate data warehouse.

Those technologies may be discussed only as future architecture options
where appropriate. They must not be reintroduced into the current
implementation merely because they appeared in earlier concepts.

------------------------------------------------------------------------

# 7. Current System Architecture

The current target architecture is:

``` text
BUSINESS USERS
      ↓
React.js + Vite + Tailwind CSS
      ↓
REST APIs
      ↓
Node.js + Express.js
      ↓
Authentication / Authorization / Validation
      ↓
Business Logic
      ↓
mysql2
      ↓
MySQL
      ├── Operational Data
      ├── Historical / SCD Type 2 Structures
      │      └── database-only historical/audit purpose
      │
      └── Curated CURRENT-STATE Reporting Views / Tables
                   ↓
                Power BI
```

Supporting infrastructure may include Cloudflare/CDN, AWS hosting, and
AWS S3 where required.

Development tooling includes VS Code, Git, GitHub, and Postman.

### 7.1 Connectivity Boundary

React must never connect directly to MySQL.

The required application data path is:

``` text
React
  ↓
REST API
  ↓
Node.js / Express
  ↓
mysql2
  ↓
MySQL
```

Power BI consumes appropriately prepared MySQL reporting structures,
preferably curated views/tables.

### 7.2 API Versioning

All current REST API routes use:

``` text
/api/v1/<resource>
```

No current production endpoint may omit the version prefix. Future
breaking API changes require a new major API version rather than
silently changing an existing contract.

### 7.3 Power BI Data Boundary

Historical/SCD Type 2 structures may exist in MySQL for historical and
audit tracking, but they are database-only structures for this
architecture. Power BI must consume curated **CURRENT-STATE** reporting
structures and must not consume, join, relate, or visualize SCD Type 2
structures.

------------------------------------------------------------------------

# 8. Document Objective

The BizLink PRD functions simultaneously as:

1.  Product Specification
2.  System Specification
3.  Engineering Contract
4.  Implementation Blueprint
5.  Testing Specification
6.  Analytics Specification

The documentation must provide enough implementation-level precision for
the coding agent to implement the application with minimal ambiguity
while avoiding unnecessary production source code inside the PRD.

The PRD must define:

-   requirements;
-   architecture;
-   interfaces;
-   contracts;
-   schemas;
-   workflows;
-   validation rules;
-   permissions;
-   database behavior;
-   security behavior;
-   testing requirements;
-   acceptance criteria;
-   file/module responsibilities;
-   implementation constraints.

------------------------------------------------------------------------

# 9. Required Document Size

The complete `docs/prd/` documentation set targets approximately
**40--50 rendered pages**, with approximately **45 pages** as the
preferred target.

The target applies to the complete collection, not to any single file.

The page count must come from meaningful engineering detail rather than
padding. The completed documentation set should cover requirements,
workflows, architecture, API contracts, database specifications,
security, frontend/backend behavior, analytics, Power BI, edge cases,
testing, deployment, roadmap, acceptance criteria, and traceability.

------------------------------------------------------------------------

# 10. Requirement ID System

Requirements use structured identifiers.

### 10.1 Functional Requirements

Examples:

-   `FR-AUTH-001`
-   `FR-BIZ-001`
-   `FR-DISC-001`
-   `FR-MATCH-001`
-   `FR-CONN-001`
-   `FR-MSG-001`
-   `FR-COLL-001`
-   `FR-REV-001`
-   `FR-TRUST-001`
-   `FR-ADMIN-001`
-   `FR-ANL-001`

### 10.2 Non-Functional Requirements

Examples:

-   `NFR-SEC-001`
-   `NFR-PERF-001`
-   `NFR-SCAL-001`
-   `NFR-UX-001`
-   `NFR-DATA-001`
-   `NFR-AVAIL-001`
-   `NFR-OBS-001`

### 10.3 Other Requirement Families

-   Database: `DB-001`, `DB-002`, ...
-   API: `API-001`, `API-002`, ...
-   UI: `UI-001`, `UI-002`, ...
-   Testing: `TC-001`, `TC-002`, ...

Requirement identifiers should remain stable when cross-file references
are created.

------------------------------------------------------------------------

# 11. Document Control

  -----------------------------------------------------------------------
  Field                               Value
  ----------------------------------- -----------------------------------
  Product Name                        BizLink

  Document Name                       Master Product Requirements +
                                      Engineering Specification

  PRD Version                         v9

  Product Version                     MVP / current implementation scope

  Document Status                     Draft --- content generation in
                                      progress

  Prepared For                        BizLink implementation using an AI
                                      coding agent

  Intended Audience                   Product, architecture, development,
                                      QA, security, analytics, DevOps,
                                      and coding-agent workflows

  Source Documents                    Master PRD prompt; Project
                                      Abstract, Finalized System
                                      Architecture, and ER Schema when
                                      supplied

  Generation Model                    Multi-file Markdown under
                                      `docs/prd/`

  Current Batch                       Batch 01 --- first three content
                                      files
  -----------------------------------------------------------------------

### 11.1 Revision History

  -----------------------------------------------------------------------
  Version                 Change                  Status
  ----------------------- ----------------------- -----------------------
  v9                      Current master PRD      Authoritative source
                          specification           

  Batch 01                Generated overview,     Draft
                          personas/product, and   
                          frontend section-group  
                          files                   
  -----------------------------------------------------------------------

### 11.2 Terminology

  -----------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- -----------------------------------
  BizLink                             B2B business discovery, evaluation,
                                      connection, and collaboration
                                      platform

  Business                            A business entity represented on
                                      BizLink

  Business Owner                      Primary product persona with
                                      ownership authority

  Business Representative / Partner   Authorized business member acting
                                      for a business

  Offer / Service                     What a business provides

  Need                                What a business requires

  Discovery                           Structured search and filtering of
                                      businesses

  Match                               Rule-based relationship between an
                                      offer and a need or other relevant
                                      criteria

  Connection                          Explicit business-to-business
                                      relationship request/state

  Collaboration                       Structured business relationship
                                      with a lifecycle

  Trust Evidence                      Verification, certifications,
                                      achievements, reviews, and related
                                      credibility evidence

  Current-State Reporting             Analytics structures representing
                                      current operational state

  SCD Type 2                          Historical versioning approach used
                                      selectively inside MySQL

  Power BI                            Required analytics and dashboard
                                      platform
  -----------------------------------------------------------------------

### 11.3 Assumptions

1.  **Assumption:** The separate Project Abstract, finalized
    architecture artifact, and draw.io ER XML may be supplied later if
    they are not present in the working repository.
2.  **Assumption:** The technology stack and architectural constraints
    explicitly stated in the master prompt are current.
3.  **Recommended Design Decision:** Until the authoritative ER artifact
    is available, this PRD should not invent exact column names, data
    types, or foreign-key structures that depend on the ER model.
4.  **Proposed Requirement:** Cross-file links should use relative
    Markdown paths under `docs/prd/`.
5.  **Future Enhancement:** Additional architecture components may be
    introduced only through explicit future-scope decisions and must not
    silently alter the MVP architecture.

------------------------------------------------------------------------

# 12. Executive Product Overview

## 12.1 What BizLink Is

BizLink is a web-based B2B networking, discovery, and collaboration
platform for businesses and business representatives. It creates a
structured environment in which businesses can present their
capabilities and requirements, discover relevant organizations, evaluate
credibility, establish connections, communicate, and form
collaborations.

## 12.2 Who Uses It

The primary personas are:

-   Business Owner;
-   Business Partner / Business Representative;
-   Administrator.

Business staff and membership relationships must also be supported
through business-level permissions where defined.

Detailed personas and product objectives are specified in
[`01-personas-and-product.md`](./01-personas-and-product.md).

## 12.3 Problem Solved

BizLink addresses the operational limitation of referral-dependent
business discovery. A business may have a specific requirement but lack
a structured mechanism for discovering suitable businesses beyond its
immediate network.

The platform structures:

``` text
Who the business is
       +
What it offers
       +
What it needs
       +
What collaboration it accepts
       ↓
Structured discovery
       ↓
Evaluation
       ↓
Connection
       ↓
Collaboration
```

## 12.4 Core Value Proposition

The platform aims to improve:

-   business discovery;
-   visibility of structured offerings and needs;
-   evaluation of business credibility;
-   connection formation;
-   collaboration initiation and history;
-   trust formation;
-   business analytics.

## 12.5 Product Boundaries

BizLink is not intended to become:

-   a generic social-media platform;
-   a financial reporting platform;
-   an AI-first matching platform in the current version;
-   a large enterprise communication suite;
-   an unnecessarily complex distributed system.

Current matching is rule-based and explainable. AI/ML matching, semantic
search, intelligent recommendations, natural-language search,
AI-generated insights, mobile applications, and deeper integrations
remain future scope unless explicitly promoted into current scope
through an approved change.

## 12.6 Core Journey

``` text
DISCOVER
   ↓
EVALUATE
   ↓
CONNECT
   ↓
COLLABORATE
```

This journey is the organizing product principle for the detailed
requirements in the subsequent PRD files.

------------------------------------------------------------------------

## Cross-File Navigation

-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [02 --- Frontend](./02-frontend.md)
-   [03 --- Backend and API](./03-backend-and-api.md)
-   [04 --- Database](./04-database.md)
-   [05 --- Security](./05-security.md)
-   [06 --- Features and Workflows](./06-features-and-workflows.md)
-   [07 --- Power BI and Analytics](./07-powerbi-and-analytics.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
-   [09 --- Roadmap, Traceability and
    Deployment](./09-roadmap-traceability-and-deployment.md)
