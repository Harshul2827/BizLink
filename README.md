# BizLink

### A Structured B2B Business Discovery & Collaboration Platform

**Connect · Collaborate · Scale · Grow**

> BizLink is a B2B business discovery and networking platform that helps
> businesses move beyond traditional referral networks to discover
> relevant partners, suppliers, and service providers through structured
> profiles, service-and-requirement matching, trusted connections,
> messaging, and collaboration workflows.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Core Flow](#core-flow)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Analytics & Power BI](#analytics--power-bi)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Build Process](#build-process)
- [Getting Started](#getting-started)
- [Team](#team)

---

## Overview

Small and medium businesses overwhelmingly rely on personal contacts,
word-of-mouth, and existing networks to find clients, suppliers, and
service providers. This dependency limits discovery to whoever is
already in a business owner's circle, and makes cross-domain
collaboration dependent on who you happen to know rather than who
actually fits your requirements.

BizLink replaces that informal, referral-driven process with a
structured digital platform. Businesses create verifiable profiles that
explicitly state what they **offer**, what they **need**, and what kind
of collaboration they're open to. Other businesses discover them through
structured search, filtering, and rule-based matching — not luck or
proximity to the right conversation.

For example, a veterinary clinic that needs AC installation and
maintenance, a digital marketing agency, or a packaging supplier can all
use BizLink to find and directly engage the right counterpart, based on
stated offerings and requirements rather than who they happen to know.

## Problem Statement

- Small and medium businesses depend heavily on personal contacts,
  referrals, and existing networks to find clients, suppliers, service
  providers, and partners.
- Referral-based networking limits discovery and makes cross-domain
  collaboration dependent on personal connections rather than structured
  evaluation.
- There is no structured digital platform where businesses can discover
  relevant partners beyond their existing network, evaluate credibility
  objectively, and initiate collaboration directly.

## Core Flow

```
DISCOVER → EVALUATE → CONNECT → COLLABORATE
```

A business is discovered through search and matching, evaluated through
verification and reviews, connected to via requests and messaging, and
collaborated with through tracked opportunities and partnerships.

## Key Features

| Area | Capability |
|---|---|
| **Business Profiles** | Industry, location, service area, products/services offered, needs/requirements, certifications, awards, and milestones |
| **Discovery** | Keyword search, industry filtering, location filtering, service filtering, and discovery by stated needs/offerings |
| **Matching** | Structured, rule-based, explainable matching on offerings, requirements, industry, and location — designed for future AI-based enhancement, not dependent on it |
| **Connections & Messaging** | Send/accept/reject connection requests, direct in-app messaging between connected businesses, connection history tracking |
| **Collaboration & Opportunities** | Post business requirements or opportunities, initiate and manage collaboration requests, track partnerships through to completion |
| **Trust & Verification** | Business verification status, certifications and achievements, reviews and ratings, and trust signals for partner evaluation |
| **Growth Showcase** | An optional, privacy-controlled, high-level view of growth trends and milestones — not a financial reporting module, and never exposes detailed financials |
| **Administration** | Business verification, content moderation, user management, and platform-wide analytics |

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js, Vite, Tailwind CSS | Component-based UI, fast builds, utility-first styling |
| API Layer | RESTful APIs (`/api/v1/`) | Standardized client–server communication |
| Backend | Node.js, Express.js | Application server and business logic |
| DB Connectivity | `mysql2` | Node.js driver for MySQL connectivity |
| Database | MySQL | Relational operational data storage |
| Analytics | Power BI | Dashboards and business insights over curated reporting data |
| Auth & Security | JWT, bcrypt | Token-based authentication and password hashing |
| Dev & Testing | Git, GitHub, Postman | Version control and API testing |

## System Architecture

```
React.js + Vite + Tailwind CSS   (Client Layer)
            ↓
         REST APIs
            ↓
Node.js + Express.js             (Server Layer: API routes → middleware →
            ↓                     validation → controllers → business logic)
         mysql2
            ↓
          MySQL                  (Operational schema)
            ↓
   Curated Current-State Views
            ↓
         Power BI                (Dashboards & Analytics)
```

The frontend never connects directly to MySQL — all data flows through
the authenticated, validated REST API layer. Security (authentication,
authorization, input validation, and error handling/logging) is enforced
as its own cross-cutting layer across the backend, not bolted on per
route.

## Database Design

BizLink's MySQL schema is split into two concerns:

- **Operational schema (OLTP)** — the live, current-state tables that
  power the application itself: users, businesses, business membership,
  categories, services, needs, matches, connections, messages,
  collaborations, collaboration participants, reviews, posts, post
  interactions, reports, and activity events.
- **Analytics star schema** — a small set of curated, current-state
  dimension and fact tables purpose-built for reporting, kept separate
  from the operational tables they're derived from.

A small number of tables — specifically the two dimension tables that
need historical tracking — use **SCD Type 2** (Slowly Changing
Dimension) to preserve a full history of changes over time, rather than
overwriting prior states. This is applied selectively: only to tables
where historical tracking is genuinely needed, not uniformly across the
schema.

## Analytics & Power BI

BizLink includes a Power BI dashboard built on curated, current-state
reporting data derived from the operational database. Two rules govern
this layer:

1. **SCD Type 2 structures are excluded from Power BI.** Historical/SCD
   tables exist for database-side audit and historical tracking only —
   Power BI reads only curated, current-state data, never the SCD
   structures directly.
2. **The dashboard is interactive and published.** Visuals cross-filter
   and cross-highlight each other natively, and the finished report is
   published to the Power BI Service — not left as a local file — with
   access managed through a secure, authorized sharing mechanism.

## Project Structure

```
BizLink/
├── frontend/              # React + Vite + Tailwind client
├── backend/                # Node.js + Express server
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── views/
│   └── schema/
├── docs/
│   ├── prd/                # Full product requirements documentation
│   └── source/              # Original abstract, ER schema, architecture diagram
├── tests/
├── scripts/
├── .env.example
└── README.md                # This file
```

## Documentation

The complete Product Requirements Document lives in
[`docs/prd/`](./docs/prd/README.md), split into focused files covering
product scope, frontend, backend/API, database, security, feature
workflows, Power BI/analytics, testing, and the build roadmap. Start
there for anything beyond this overview — it is the authoritative
specification this project is built from.

Original source materials (project abstract, ER schema, and system
architecture diagram) are preserved in `docs/source/` and take
precedence over the PRD wherever the two are ambiguous or in conflict.

## Build Process

BizLink is implemented in strict, gated layers rather than feature by
feature:

```
Layer 1 — Database
       ↓
Layer 2 — Backend
       ↓
Layer 3 — Frontend
       ↓
Power BI
```

Each layer is completed and verified before the next begins. Within the
backend and frontend layers, independent feature tracks (profiles,
discovery/matching, connections/messaging, collaborations/trust/admin,
analytics) are built in parallel once each layer's shared foundation is
in place. Human approval is required at every layer boundary and before
any major architectural or schema change — nothing proceeds silently.

## Getting Started

> Setup instructions will be added once the Database and Backend layers
> are implemented. In the meantime, see [`docs/prd/`](./docs/prd/) for
> the full technical specification.

## Team

**Group 34 — Department of Computer Engineering**
Bharatiya Vidya Bhavan's Sardar Patel Institute of Technology, Mumbai

| Name | Roll Number |
|---|---|
| Harshul Shah | 2024300225 |
| Rushil Patadia | 2024300161 |
| Aryan R Shah | 2024300223 |

---

*Secure · Scalable · Reliable · Built for Business Growth*
