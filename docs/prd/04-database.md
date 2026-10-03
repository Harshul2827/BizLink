# BizLink Product Requirements Document --- 04 Database

> **Document Group:** Sections 29--35A + Section 50\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final

------------------------------------------------------------------------

# 29. Database Architecture

## 29.1 Database Technology

BizLink uses:

-   MySQL as the operational relational database;
-   `mysql2` as the Node.js database driver.

The database is authoritative for transactional persistence and
relational integrity.

The frontend must never connect directly to MySQL.

## 29.2 Database Role

The database supports:

1.  operational application data;
2.  referential integrity;
3.  transaction processing;
4.  relationship and collaboration history;
5.  activity/audit structures;
6.  selective historical/SCD Type 2 structures;
7.  curated current-state reporting structures for Power BI.

## 29.3 Authoritative Schema Rule

The master prompt identifies the BizLink relational database / ER schema
in draw.io XML as the authoritative source for exact database structure.

**Important source limitation for this batch:** the separate ER/draw.io
XML is not present in the current workspace. Therefore this document
specifies the required entities, design rules, constraints, indexing
strategy, and implementation contract without inventing exact column
names or data types that must come from the authoritative ER artifact.

When the ER schema becomes available:

1.  compare every table;
2.  compare every column;
3.  compare data types;
4.  compare nullability;
5.  compare primary keys;
6.  compare foreign keys;
7.  compare unique constraints;
8.  compare indexes;
9.  compare relationship cardinality;
10. document approved deviations.

If this document conflicts with the actual ER schema, the ER schema wins
for database structure.

## 29.4 Operational Entities

The current product model requires these operational entities:

-   `users`
-   `business_members`
-   `categories`
-   `businesses`
-   `services`
-   `needs`
-   `matches`
-   `connections`
-   `messages`
-   `collaborations`
-   `collaboration_participants`
-   `reviews`
-   `posts`
-   `post_interactions`
-   `reports`
-   `activity_events`

Exact fields and relationships must follow the authoritative ER schema.

## 29.5 Analytics Structures

The current architecture identifies:

-   `dw_dim_date`
-   `dw_dim_business`
-   `dw_dim_user`
-   `dw_fact_collaboration`
-   `dw_fact_review`

These structures are database-side analytics/reporting structures.

Power BI must consume curated current-state reporting structures and
must exclude SCD Type 2/history/audit structures.

------------------------------------------------------------------------

# 30. Relational Design Requirements

## 30.1 Normalization

Operational tables should be normalized to avoid unnecessary duplication
and update anomalies.

The database should preserve clear separation between:

-   users;
-   business membership;
-   businesses;
-   business offerings;
-   business needs;
-   relationships;
-   messages;
-   collaborations;
-   reviews;
-   content;
-   moderation/reporting;
-   activity.

Denormalization should require a documented performance or reporting
reason.

## 30.2 Primary Keys

Every persistent entity must have a stable primary key according to the
authoritative ER schema.

The implementation must not introduce multiple competing identifiers for
the same entity without a documented reason.

## 30.3 Foreign Keys

Relationships must be enforced through foreign keys where appropriate.

Foreign keys should preserve:

-   referential integrity;
-   valid ownership;
-   valid business membership;
-   valid collaboration participants;
-   valid service/need relationships;
-   valid reviews;
-   valid activity relationships.

## 30.4 Unique Constraints

Unique constraints should enforce business invariants that must never
depend solely on application logic.

Examples include:

-   user identity uniqueness;
-   business membership uniqueness;
-   applicable business/category uniqueness;
-   duplicate relationship prevention where the schema supports a
    natural uniqueness rule;
-   other source-schema-specific uniqueness rules.

Exact constraints must follow the authoritative ER schema.

## 30.5 Nullability and Defaults

Nullability must communicate whether information is:

-   required;
-   optional;
-   not yet known;
-   not applicable.

Do not use nullable fields merely to avoid deciding a required business
rule.

Defaults must represent legitimate domain defaults rather than silently
hiding missing data.

## 30.6 Status Fields

Status values should be represented using a controlled domain.

Examples:

``` text
Connection:
PENDING
ACCEPTED
REJECTED
CANCELLED
BLOCKED
```

``` text
Collaboration:
DRAFT
REQUESTED
NEGOTIATING
ACCEPTED
ACTIVE
COMPLETED
DECLINED
CANCELLED
```

Exact status values must remain consistent with the final schema and API
contracts.

## 30.7 Timestamps

Transactional entities should record appropriate creation/update
timestamps where required by the source schema and product behavior.

Time handling should be consistent across:

-   API;
-   database;
-   seed data;
-   reporting;
-   Power BI.

## 30.8 Soft Delete

Soft deletion should be used where business history or relationship
integrity requires preservation.

**Recommended Design Decision:** Do not apply soft deletion mechanically
to every table. The table lifecycle should determine whether records
are:

-   hard-deleted;
-   soft-deleted;
-   deactivated;
-   retained permanently for audit/history.

------------------------------------------------------------------------

# 31. Table-Level Specification Requirements

For every operational table, the completed database documentation must
define:

1.  purpose;
2.  columns and data types;
3.  primary key;
4.  foreign keys;
5.  unique constraints;
6.  nullable/default behavior;
7.  indexes;
8.  check constraints where supported;
9.  timestamps;
10. soft-delete/deactivation behavior;
11. audit behavior;
12. cardinality;
13. lifecycle;
14. delete behavior;
15. update behavior.

The following table contracts establish the required role of each
entity.

## 31.1 `users`

**Purpose:** Store application user identities and
authentication-related account state.

Requirements:

-   unique user identity;
-   password hash rather than plaintext password;
-   account status;
-   appropriate timestamps;
-   security-sensitive fields protected.

Authentication secrets must never be exposed through normal user APIs.

## 31.2 `business_members`

**Purpose:** Associate users with businesses and represent
business-level authority.

Requirements:

-   user-to-business relationship;
-   membership/role information;
-   lifecycle/status;
-   uniqueness preventing duplicate active membership records where
    applicable.

This table is central to business-level authorization.

## 31.3 `categories`

**Purpose:** Controlled business classification used for discovery and
matching.

Requirements:

-   stable identity;
-   unique category representation;
-   active/inactive behavior where applicable.

## 31.4 `businesses`

**Purpose:** Store business identity and profile information.

Requirements:

-   business identity;
-   classification;
-   location information;
-   profile information;
-   status;
-   timestamps;
-   appropriate visibility/state fields.

Exact columns follow the ER schema.

## 31.5 `services`

**Purpose:** Store business offers/services.

Requirements:

-   owning business;
-   structured service information;
-   category association where applicable;
-   active/lifecycle state;
-   timestamps.

## 31.6 `needs`

**Purpose:** Store business requirements/needs.

Requirements:

-   owning business;
-   structured need information;
-   relevant category/service relationships;
-   state;
-   timing/budget/location fields where supported by the final schema.

## 31.7 `matches`

**Purpose:** Store or materialize rule-based matching results where the
architecture requires persistence.

A match should retain enough information to explain why two business
records were considered relevant.

AI-generated matching data is not part of the current schema
requirement.

## 31.8 `connections`

**Purpose:** Represent explicit business relationship requests and
states.

The design must prevent:

-   self-connections;
-   duplicate active relationships;
-   impossible state transitions.

## 31.9 `messages`

**Purpose:** Store in-app messages associated with authorized
conversations.

Requirements:

-   conversation/relationship association as defined by schema;
-   sender;
-   content;
-   timestamps;
-   read state where supported;
-   retention/security behavior.

## 31.10 `collaborations`

**Purpose:** Represent structured business collaboration lifecycle.

Requirements include, where supported:

-   initiating/related businesses;
-   title;
-   related service/need;
-   status;
-   dates;
-   completion state;
-   timestamps.

## 31.11 `collaboration_participants`

**Purpose:** Represent participants in collaborations.

The design must preserve participant membership and prevent duplicate
participant assignments where applicable.

## 31.12 `reviews`

**Purpose:** Represent business reviews associated with eligible
business interactions.

Requirements:

-   reviewer;
-   reviewed business;
-   eligibility relationship;
-   rating;
-   content where supported;
-   timestamps;
-   moderation behavior where supported.

## 31.13 `posts`

**Purpose:** Store business-oriented posts, announcements,
opportunities, and requirements.

Posts must remain scoped to useful B2B activity.

## 31.14 `post_interactions`

**Purpose:** Represent supported interactions with business posts.

The exact interaction model must follow the authoritative ER schema.

## 31.15 `reports`

**Purpose:** Store reports of content, businesses, users, or other
supported platform concerns.

Requirements:

-   reporter;
-   target;
-   reason/category;
-   status;
-   resolution metadata where supported;
-   timestamps.

## 31.16 `activity_events`

**Purpose:** Capture relevant platform/business activity for operational
visibility, auditing, and analytics where appropriate.

Activity records must avoid storing unnecessary sensitive data.

------------------------------------------------------------------------

# 32. Indexing and Query Design

## 32.1 Indexing Principle

Indexes must support real query patterns rather than being added
indiscriminately.

Every index should have a documented purpose.

## 32.2 Business Discovery

Index strategy should support:

-   business category;
-   active/status filtering;
-   location;
-   service/category relationships;
-   searchable business fields where appropriate;
-   common filter combinations.

## 32.3 Services and Needs

Indexes should support:

-   owning business;
-   category;
-   status;
-   matching/discovery attributes;
-   relevant date/status combinations.

## 32.4 Connections

Indexes should support:

-   business/user lookup;
-   connection state;
-   pending requests;
-   duplicate detection;
-   relationship retrieval.

## 32.5 Messages

Indexes should support:

-   conversation lookup;
-   chronological retrieval;
-   unread state where needed;
-   participant access.

Avoid loading an entire message history when only a page is required.

## 32.6 Collaborations

Indexes should support:

-   participant lookup;
-   business lookup;
-   status;
-   lifecycle dates;
-   active collaborations.

## 32.7 Reviews

Indexes should support:

-   reviewed business;
-   reviewer;
-   collaboration eligibility;
-   review timestamps.

## 32.8 Activity Events

Indexes should support:

-   actor;
-   business;
-   event type;
-   timestamp;
-   administrative/audit queries.

## 32.9 Composite Indexes

Composite indexes should follow actual filtering and ordering patterns.

The final index set must be validated using realistic discovery,
relationship, collaboration, and analytics queries.

------------------------------------------------------------------------

# 33. Analytics Data Architecture

## 33.1 Current-State Reporting

The required architecture is:

``` text
Operational MySQL
      ↓
Data Cleaning / Validation
      ↓
Curated CURRENT-STATE Reporting Views / Tables
      ↓
Power BI
```

Power BI should not query raw operational tables unnecessarily when a
curated reporting structure is more appropriate.

## 33.2 Data Cleaning

Cleaning/validation may include:

-   duplicate detection;
-   invalid/inconsistent values;
-   invalid categories;
-   missing values;
-   malformed locations;
-   invalid dates;
-   status normalization;
-   derived fields;
-   standardized values.

Cleaning must not corrupt authoritative transactional data.

## 33.3 SCD Type 2

SCD Type 2 is used only where historical attribute versions are
genuinely required.

It is not a requirement to make every operational table historical.

### Suitable Candidates

Potential candidates include:

-   business attributes;
-   category assignments;
-   location/profile dimensions;
-   user/business-role dimensions where historical reporting requires
    them.

### Poor Candidates

Do not use SCD2 merely for:

-   passwords;
-   messages;
-   temporary records;
-   raw logs;
-   transactional join structures.

## 33.4 Baseline SCD Structures

The baseline analytics model identifies:

-   `dw_dim_business`
-   `dw_dim_user`

These structures should use the final ER/database design as their
foundation.

Typical SCD2 fields include:

-   surrogate key;
-   natural/business key;
-   effective-from timestamp;
-   effective-to timestamp;
-   current-row indicator;
-   optional version number.

Exact names and types must follow the approved schema.

## 33.5 SCD2 Update Sequence

For an attribute change:

``` text
Find current row
     ↓
Close current version
     ↓
effective_to = change time
is_current = false
     ↓
Insert new version
     ↓
effective_from = change time
effective_to = NULL
is_current = true
     ↓
Commit
```

A database constraint/transaction strategy must prevent multiple current
versions for the same natural key.

## 33.6 Power BI Exclusion Rule

The following are explicitly excluded from the Power BI model:

-   SCD Type 2 history tables;
-   historical dimension versions;
-   audit-only structures;
-   raw activity/audit structures when not part of a curated
    current-state reporting contract.

The reporting model must expose only intended current-state reporting
data.

------------------------------------------------------------------------

# 34. Seed Data and Demo Dataset

## 34.1 Deterministic Seed Requirements

Seed data must be:

-   fictional;
-   deterministic;
-   repeatable;
-   valid against constraints;
-   safely resettable or idempotent.

No real personal data should be used.

## 34.2 Minimum Dataset

The demonstration dataset should contain at least:

-   15 businesses;
-   6 categories;
-   15--20 users;
-   30+ services;
-   20+ needs;
-   15+ matches;
-   10+ connections with multiple statuses;
-   6+ collaborations across multiple states;
-   12+ reviews;
-   10+ posts;
-   20+ activity events;
-   at least one administrator;
-   verified and unverified businesses;
-   suspended/inactive state where supported;
-   multiple cities;
-   at least one cross-domain scenario.

## 34.3 Required Demo Scenarios

The seed dataset must make the following scenarios demonstrable.

### Veterinary Clinic + HVAC Need

A veterinary clinic must have an HVAC-related need.

A suitable HVAC provider must exist as a discoverable business with a
corresponding service/offer.

The dataset should support:

``` text
Veterinary Clinic
    ↓
HVAC Need
    ↓
HVAC Provider
    ↓
Match
    ↓
Evaluation
    ↓
Connection
    ↓
Collaboration
```

### Marketing Scenario

A business must have a marketing need, with a suitable marketing
agency/service provider represented.

### Packaging / Supply Scenario

A packaging or supply requirement must have a relevant provider.

### Discovery

Filters should produce meaningful differences across:

-   categories;
-   locations;
-   services;
-   needs;
-   status.

### Relationships

Connection records must demonstrate:

-   pending;
-   accepted;
-   rejected;
-   cancelled;
-   blocked where supported.

### Collaborations

The dataset should demonstrate:

-   active;
-   completed;
-   declined;
-   cancelled;
-   requested/negotiating where supported.

### Trust

Include:

-   verified;
-   unverified;
-   reviewed;
-   different credibility evidence states.

### Analytics

The data must be sufficient to populate the Power BI KPI areas defined
in [`07-powerbi-and-analytics.md`](./07-powerbi-and-analytics.md).

------------------------------------------------------------------------

# 35. Database Implementation Artifacts

The implementation must separate:

``` text
database/
├── migrations/
├── seeds/
├── views/
└── schema/
```

Do not mix migrations, seed data, and reporting views into one folder.

## 35.1 Migrations

Recommended examples:

``` text
database/migrations/
├── 001_initial_schema.sql
├── 002_auth_constraints.sql
├── 003_business_relationships.sql
├── 004_discovery_and_matching.sql
├── 005_collaboration_reviews.sql
├── 006_reporting_structures.sql
└── ...
```

The actual migration sequence must be derived from the final schema and
dependencies.

Each migration should be:

-   deterministic;
-   ordered;
-   reviewable;
-   safely applicable;
-   compatible with the project migration strategy.

## 35.2 Seeds

Recommended:

``` text
database/seeds/
├── 001_categories.sql
├── 002_users.sql
├── 003_businesses.sql
├── 004_services.sql
├── 005_needs.sql
├── 006_relationships.sql
├── 007_collaborations.sql
├── 008_reviews.sql
├── 009_posts.sql
└── 010_activity.sql
```

The exact sequence may change according to foreign-key dependencies.

## 35.3 Reporting Views

Reporting SQL belongs under:

``` text
database/views/
```

Views should be:

-   current-state oriented;
-   Power BI appropriate;
-   documented;
-   deterministic;
-   free of SCD2/history leakage.

------------------------------------------------------------------------

# 35A. Database Quality and Transaction Requirements

## 35A.1 Referential Integrity

The database must prevent orphaned records wherever the business
lifecycle requires referential integrity.

## 35A.2 Transaction Boundaries

Transactions are mandatory for multi-record atomic operations.

At minimum:

-   business + membership creation;
-   connection state changes requiring dependent writes;
-   collaboration + participants;
-   eligible review creation with dependent state changes;
-   SCD2 updates;
-   moderation + required activity/audit write.

## 35A.3 Concurrency

The database design must handle:

-   simultaneous connection requests;
-   simultaneous state transitions;
-   duplicate collaboration actions;
-   concurrent SCD2 updates.

Use:

-   unique constraints;
-   transactions;
-   appropriate row locking;
-   appropriate isolation;
-   conflict handling.

## 35A.4 Rollback

A failed transaction must not leave partial relationship or
collaboration state.

Example:

``` text
BEGIN
  Create Collaboration
  Create Participant A
  Create Participant B
  Write Activity Event
  ↓
  If any step fails:
      ROLLBACK
  Else:
      COMMIT
```

------------------------------------------------------------------------

# 50. Database-to-Feature Mapping

The final implementation must maintain a traceable mapping between
database entities and product features.

  Entity                         Primary Product Areas
  ------------------------------ ----------------------------------------------
  `users`                        Authentication, profiles
  `business_members`             Business membership, authorization
  `categories`                   Business classification, discovery, matching
  `businesses`                   Business profiles, discovery, trust
  `services`                     Offers, discovery, matching
  `needs`                        Needs, discovery, matching
  `matches`                      Rule-based matching
  `connections`                  Relationship formation
  `messages`                     Messaging
  `collaborations`               Collaboration workflow
  `collaboration_participants`   Collaboration membership
  `reviews`                      Trust/reputation
  `posts`                        Opportunities/requirements
  `post_interactions`            Business content interaction
  `reports`                      Moderation
  `activity_events`              Activity/audit/analytics
  `dw_dim_date`                  Power BI time analysis
  `dw_dim_business`              Power BI business analysis
  `dw_dim_user`                  Power BI user analysis
  `dw_fact_collaboration`        Power BI collaboration analysis
  `dw_fact_review`               Power BI trust/review analysis

The completed schema must be cross-checked against:

-   frontend data requirements;
-   backend API contracts;
-   security/authorization rules;
-   matching logic;
-   collaboration lifecycle;
-   review eligibility;
-   Power BI reporting requirements.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [02 --- Frontend](./02-frontend.md)
-   [03 --- Backend and API](./03-backend-and-api.md)
-   [05 --- Security](./05-security.md)
-   [06 --- Features and Workflows](./06-features-and-workflows.md)
-   [07 --- Power BI and Analytics](./07-powerbi-and-analytics.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
-   [09 --- Roadmap, Traceability and
    Deployment](./09-roadmap-traceability-and-deployment.md)
