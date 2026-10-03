# BizLink Product Requirements Document --- 06 Features and Workflows

> **Document Group:** Sections 39--49, 64--66\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final
> **Dependency:** This document extends `00-overview.md` through
> `05-security.md`; it does not redefine their architecture, entity
> model, API conventions, or security model.

------------------------------------------------------------------------

# 39. Feature and Workflow Specification

## 39.1 Feature Contract

Every major BizLink feature must define:

1.  Feature ID
2.  Feature name
3.  Purpose
4.  Persona
5.  Preconditions
6.  Trigger
7.  Main workflow
8.  Alternate workflows
9.  Validation
10. Permissions
11. Database impact
12. API impact
13. Frontend impact
14. Loading state
15. Empty state
16. Error state
17. Security considerations
18. Edge cases
19. Acceptance criteria

The detailed feature specifications below deliberately connect these
layers.

------------------------------------------------------------------------

## 39.2 Registration and Business Setup

**Feature ID:** `FR-AUTH-001`\
**Feature:** Registration → Business Setup

### Purpose

Allow a new user to establish an authenticated identity and create or
join the appropriate business context.

### Persona

-   Business Owner
-   Business Representative where membership/join flow permits

### Preconditions

-   User is not already registered with the conflicting unique identity.
-   Submitted data passes validation.

### Main Workflow

``` text
Registration UI
    ↓
POST /api/v1/auth/register
    ↓
User created
    ↓
Authenticated state established
    ↓
Business setup UI
    ↓
POST /api/v1/businesses
    ↓
Business + owner membership transaction
    ↓
Dashboard / onboarding
```

### Database

Uses:

-   `users`
-   `businesses`
-   `business_members`
-   applicable `activity_events`

The business + membership creation must use a transaction as specified
in `04-database.md`.

### Security

-   bcrypt password hashing;
-   authentication lifecycle;
-   business ownership authorization;
-   duplicate-identity protection;
-   rate limiting.

### Acceptance Criteria

-   Duplicate identity is rejected safely.
-   Password is never stored plaintext.
-   Business creation creates the required membership.
-   A partial business creation cannot leave an orphaned owner
    membership.
-   Unauthorized users cannot modify another business.

------------------------------------------------------------------------

## 39.3 Business Profile Management

**Feature ID:** `FR-BIZ-001`

### Purpose

Provide a credible, structured business presence.

### Frontend

Primary UI: `/profile` and `/business/:id`.

The editing interface is distinct from the public/evaluation view.

### API

Uses the business endpoints defined in `03-backend-and-api.md`,
particularly the authenticated business retrieval/update contracts.

### Database

Primary entity:

-   `businesses`

Related entities may include:

-   `categories`
-   `business_members`
-   trust evidence structures represented by the approved schema.

### Security

Business-resource authorization is mandatory.

### Acceptance Criteria

-   Authorized members can edit permitted business data.
-   Unauthorized members receive `403`.
-   Invalid data receives standardized validation errors.
-   Public/evaluation views expose only permitted information.

------------------------------------------------------------------------

## 39.4 Offer / Service Management

**Feature ID:** `FR-BIZ-002`

### Purpose

Allow a business to explicitly communicate what it offers.

### Main Workflow

``` text
Profile / Services
    ↓
Create Service
    ↓
Client Validation
    ↓
POST /api/v1/businesses/:id/services
    ↓
Authorization + Validation
    ↓
Service Layer
    ↓
services table
    ↓
Success Response
    ↓
Service list refresh
```

### Database

Primary entity:

-   `services`

Supporting entity:

-   `categories` where applicable.

### Security

Only an authorized business member can create/update/delete
business-owned services.

### Edge Cases

-   invalid category;
-   duplicate service where prohibited;
-   inactive business;
-   deleted/deactivated service;
-   unauthorized member;
-   malformed input.

------------------------------------------------------------------------

## 39.5 Need Management

**Feature ID:** `FR-BIZ-003`

### Purpose

Allow a business to explicitly communicate what it needs.

### Main Workflow

``` text
Business Profile
    ↓
Create Need
    ↓
POST /api/v1/businesses/:id/needs
    ↓
Authorization + Validation
    ↓
needs table
    ↓
Discovery / Matching inputs
```

### Database

Primary entity:

-   `needs`

Potential relationships:

-   `businesses`
-   `categories`
-   relevant services/matching data where supported by the schema.

### Security

Business-level authorization is required.

### Acceptance Criteria

-   Valid needs persist.
-   Invalid categories are rejected.
-   A user cannot create a need for a business they do not control.
-   Need state is reflected in discovery/matching only when eligible.

------------------------------------------------------------------------

# 40. Discovery and Evaluation

## 40.1 Business Search

**Feature ID:** `FR-DISC-001`

### Purpose

Allow authenticated users to discover relevant businesses without
requiring an existing relationship.

### Frontend

Route:

``` text
/discover
```

Core components:

-   `BusinessSearch`
-   `FilterPanel`
-   `BusinessCard`
-   `Pagination`
-   `LoadingSkeleton`
-   `EmptyState`
-   `ErrorState`

### API

``` text
GET /api/v1/discover/businesses
```

The endpoint must use bounded pagination and validated filter/sort
inputs.

### Database

Discovery relies on:

-   `businesses`
-   `categories`
-   `services`
-   `needs`
-   appropriate indexes.

### Workflow

``` text
User enters search/filter
    ↓
Frontend validates basic input
    ↓
GET /api/v1/discover/businesses
    ↓
Backend validates query
    ↓
Discovery service
    ↓
Repository / indexed MySQL query
    ↓
Paginated response
    ↓
Business cards
```

### Empty State

If no businesses match:

> No businesses match the current filters. Try removing a filter or
> broadening the search.

### Security

Discovery must enforce visibility and account/business status rules.

### Acceptance Criteria

-   Results are paginated.
-   Filters are reflected in the query.
-   Inactive/private businesses are not exposed where prohibited.
-   SQL is parameterized.
-   Empty and error states are usable.

------------------------------------------------------------------------

## 40.2 Business Evaluation

**Feature ID:** `FR-TRUST-001`

### Purpose

Give a user enough structured evidence to evaluate a potential business
relationship.

### Evaluation Information

The profile should distinguish:

1.  business identity;
2.  services/offers;
3.  needs where visible;
4.  category;
5.  location;
6.  verification;
7.  certifications;
8.  achievements;
9.  reviews;
10. relevant collaboration/activity evidence.

### Trust Principle

Verification, reputation, credibility evidence, and activity are
different concepts.

Do not silently convert them into a single unexplained score.

### Frontend

Route:

``` text
/business/:id
```

### Acceptance Criteria

-   User can inspect permitted business information.
-   Verification is distinguishable from review/reputation.
-   Private information is not exposed.
-   Connection action reflects the actual relationship state.

------------------------------------------------------------------------

# 41. Rule-Based Matching

## 41.1 Matching Contract

**Feature ID:** `FR-MATCH-001`

Current BizLink matching is deterministic and rule-based.

AI/ML matching is a **Future Enhancement**, not a current implementation
requirement.

## 41.2 Candidate Matching Factors

The approved rule system may use:

-   service/offer ↔ need compatibility;
-   category;
-   industry/business type;
-   location;
-   service area;
-   budget;
-   deadline;
-   collaboration preference;
-   verification;
-   active status.

The exact weights/rules must be implemented as an explicit deterministic
specification rather than hidden in UI code.

## 41.3 Match Explanation

Every match must have an explanation.

Example structure:

``` text
Why this match?
✓ Service category matches the requirement
✓ Provider serves the required location
✓ Business is currently active
✓ Offer satisfies the relevant need
```

The actual explanations must correspond to facts used by the rule
engine.

## 41.4 Match Workflow

``` text
Business Need
    ↓
Matching API
    ↓
Candidate retrieval
    ↓
Rule evaluation
    ↓
Eligible matches
    ↓
Explanation generated
    ↓
MatchCard
    ↓
Business evaluation
    ↓
Connection
```

### Database

Primary entities:

-   `needs`
-   `services`
-   `businesses`
-   `categories`
-   `matches`

### Security

Only information the requesting user may see can be used to construct
the returned match representation.

### Acceptance Criteria

-   Same inputs produce deterministic results.
-   Ineligible/inactive records are excluded.
-   Match explanation identifies the actual matching criteria.
-   No AI model is required.
-   Results are bounded and paginated where appropriate.

------------------------------------------------------------------------

# 42. Connections and Messaging

## 42.1 Connection Request

**Feature ID:** `FR-CONN-001`

### States

``` text
PENDING
ACCEPTED
REJECTED
CANCELLED
BLOCKED
```

### Workflow

``` text
Business Profile
    ↓
Connect
    ↓
POST /api/v1/connections
    ↓
Validate:
  - authenticated
  - not self
  - eligible relationship
  - no conflicting active request
    ↓
connections
    ↓
PENDING
```

### Acceptance

The recipient can accept/reject subject to authorization.

### Concurrency

The backend/database must prevent simultaneous requests from creating
duplicate active relationships.

### Database

Primary entity:

-   `connections`

Related:

-   `activity_events`
-   notifications where implemented.

### Edge Cases

-   self-connection;
-   duplicate active request;
-   blocked relationship;
-   suspended business;
-   deleted business;
-   simultaneous acceptance/rejection.

------------------------------------------------------------------------

## 42.2 Messaging

**Feature ID:** `FR-MSG-001`

Messaging is available only to users satisfying the approved
relationship/authorization rule.

### Workflow

``` text
Accepted / Eligible Relationship
    ↓
Messages
    ↓
Conversation
    ↓
POST /api/v1/conversations/:id/messages
    ↓
Participant Authorization
    ↓
messages
```

### Frontend

Route:

``` text
/messages
```

Components:

-   `MessageList`
-   `MessageComposer`
-   conversation list;
-   unread indicators;
-   error/loading states.

### Security

A valid JWT alone is insufficient. The user must be an authorized
participant in the conversation.

### Edge Cases

-   blocked user;
-   deleted/deactivated business;
-   unauthorized conversation ID;
-   empty message;
-   excessive message length;
-   concurrent send;
-   pagination boundary.

------------------------------------------------------------------------

# 43. Collaborations

## 43.1 Collaboration Lifecycle

**Feature ID:** `FR-COLL-001`

``` text
DRAFT
  ↓
REQUESTED
  ↓
NEGOTIATING
  ↓
ACCEPTED
  ↓
ACTIVE
  ↓
COMPLETED
```

Alternative terminal states:

``` text
REQUESTED → DECLINED
NEGOTIATING → DECLINED
ACTIVE → CANCELLED
```

Exact transition authorization must be enforced server-side.

## 43.2 Collaboration Creation

### Workflow

``` text
Eligible Relationship
    ↓
Start Collaboration
    ↓
POST /api/v1/collaborations
    ↓
Validate participants + related resources
    ↓
Transaction
    ├── collaborations
    ├── collaboration_participants
    └── activity event where required
    ↓
COMMIT
```

### Database

Primary entities:

-   `collaborations`
-   `collaboration_participants`

Potential relationships:

-   `businesses`
-   `services`
-   `needs`

### Security

Only eligible participants/business members may perform the applicable
transition.

### Acceptance Criteria

-   Invalid participant is rejected.
-   Duplicate participant assignment is prevented.
-   Invalid status transition is rejected.
-   Partial collaboration creation is rolled back.
-   Completed collaboration can become eligible for review according to
    review rules.

------------------------------------------------------------------------

# 44. Reviews and Trust

## 44.1 Review Eligibility

**Feature ID:** `FR-REV-001`

Reviews should be tied to an eligible business interaction rather than
unrestricted profile commenting.

A completed collaboration is the primary supported eligibility scenario
where the final schema supports the relationship.

### Workflow

``` text
Completed Collaboration
    ↓
Eligible for Review
    ↓
Review UI
    ↓
POST /api/v1/reviews
    ↓
Eligibility + Validation
    ↓
reviews
    ↓
Business Profile
```

### Security

A user must not be able to fabricate a review relationship.

### Edge Cases

-   collaboration not completed;
-   already reviewed;
-   reviewer not participant;
-   reviewed business mismatch;
-   invalid rating;
-   suspended account.

## 44.2 Trust Presentation

Trust UI must distinguish:

``` text
Verification
Reputation
Credibility Evidence
Activity
```

No arbitrary aggregate trust score should be introduced without an
explicit requirement and documented calculation.

------------------------------------------------------------------------

# 45. Posts, Opportunities, and Requirements

## 45.1 Business Posts

**Feature ID:** `FR-BIZ-004`

Posts are for business-oriented communication.

Supported themes include:

-   announcements;
-   milestones;
-   opportunities;
-   requirements;
-   achievements;
-   service/product updates.

### Scope Guard

Posts must not become a generic social-media feed.

### Workflow

``` text
Business Context
    ↓
Create Post
    ↓
Validation + Authorization
    ↓
POST /api/v1/posts
    ↓
posts
    ↓
Opportunity / requirement discovery
```

------------------------------------------------------------------------

# 46. Administration and Moderation

## 46.1 Verification

**Feature ID:** `FR-ADMIN-001`

Administrators can review eligible verification submissions and record
the approved verification state.

Every administrative action must be auditable.

## 46.2 Reports

A user may report supported content/business/user concerns.

``` text
Report UI
    ↓
POST /api/v1/reports
    ↓
reports
    ↓
Admin queue
    ↓
Review
    ↓
Resolution
    ↓
Activity/audit record
```

## 46.3 Moderation

Moderation actions must:

-   require administrator authorization;
-   validate the target;
-   record outcome;
-   avoid exposing internal moderation data unnecessarily;
-   preserve relevant auditability.

------------------------------------------------------------------------

# 47. Notifications

**Feature ID:** `FR-ANL-002`

Important product events may generate in-app notifications:

-   connection request;
-   connection accepted;
-   message;
-   collaboration request;
-   collaboration accepted;
-   review received;
-   verification result;
-   important administrative events.

Notifications should provide:

-   event type;
-   timestamp;
-   read/unread state;
-   target/context;
-   safe navigation target.

------------------------------------------------------------------------

# 48. Cross-Layer User Journeys

Every journey must be understood as:

``` text
User Action
   ↓
Frontend
   ↓
API
   ↓
Backend
   ↓
Database
   ↓
Response
   ↓
Frontend State
   ↓
User Feedback
```

## Journey A --- Registration → Business Setup → Profile → Offer → Need → Discover

1.  User opens `/register`.
2.  Frontend validates fields.
3.  `POST /api/v1/auth/register`.
4.  Backend validates, bcrypt-hashes password, creates user.
5.  User establishes authenticated state.
6.  Frontend routes to business setup.
7.  `POST /api/v1/businesses`.
8.  Backend transaction creates `businesses` + `business_members`.
9.  User completes profile.
10. User creates services/offers.
11. User creates needs.
12. User opens `/discover`.
13. Discovery API returns eligible businesses.

**Cross-layer dependency:** authentication, business membership,
services, needs, discovery, indexes, authorization, and frontend route
state must all agree.

## Journey B --- Search → Profile → Trust → Connection

``` text
/discover
   ↓
Search/filter
   ↓
GET /api/v1/discover/businesses
   ↓
BusinessCard
   ↓
/business/:id
   ↓
Trust/evaluation
   ↓
ConnectionButton
   ↓
POST /api/v1/connections
```

The connection state shown by the frontend must originate from the
authoritative API state.

## Journey C --- Need → Match → Evaluation → Connection → Messaging → Collaboration

``` text
Need
 ↓
Matching
 ↓
Match explanation
 ↓
Business evaluation
 ↓
Connection
 ↓
Accepted relationship
 ↓
Messaging
 ↓
Collaboration
```

The journey crosses:

-   `needs`;
-   `services`;
-   `matches`;
-   `businesses`;
-   `connections`;
-   `messages`;
-   `collaborations`;
-   `collaboration_participants`.

Each state transition must be authorized server-side.

## Journey D --- Requirement Post → Discovery → Response → Collaboration

A business publishes a requirement/opportunity, another business
discovers it, responds using the supported relationship mechanism, and
the businesses can proceed into connection/collaboration.

The implementation must preserve the distinction between:

-   a post/opportunity;
-   a connection;
-   a collaboration.

## Journey E --- Collaboration → Completion → Review

``` text
Collaboration ACTIVE
    ↓
Complete
    ↓
Review eligibility
    ↓
Create review
    ↓
Review appears in permitted business evaluation
```

Review eligibility must be enforced by backend/database relationships.

## Journey F --- Admin → Verification → Moderation → Resolution → Audit

``` text
Admin
 ↓
Admin UI
 ↓
Admin API
 ↓
Authorization
 ↓
Verification / Moderation
 ↓
Transactional update
 ↓
Activity/Audit
 ↓
Result
```

------------------------------------------------------------------------

# 49. Edge Cases and Failure Workflows

The system must explicitly test and handle:

1.  duplicate email/user identity;
2.  duplicate business;
3.  duplicate connection;
4.  self-connection;
5.  rejected connection;
6.  cancelled connection;
7.  blocked relationship;
8.  suspended user;
9.  suspended business;
10. deleted/deactivated service;
11. deleted/deactivated need;
12. invalid category;
13. malformed request;
14. unauthorized message access;
15. collaboration conflict;
16. invalid review;
17. abuse report;
18. expired token;
19. revoked/invalid token;
20. concurrent connection request;
21. SCD2 version conflict;
22. multiple-current-row SCD2 integrity violation;
23. Power BI query/reporting failure;
24. database timeout;
25. empty discovery results.

Each case must have:

-   expected HTTP/API behavior;
-   frontend state;
-   database behavior;
-   security implication;
-   test case.

------------------------------------------------------------------------

# 64. Feature Acceptance Criteria

A major feature is accepted only when:

-   product behavior is defined;
-   persona is identified;
-   frontend flow exists;
-   API contract exists;
-   authorization is enforced;
-   validation exists;
-   database behavior is correct;
-   error/loading/empty states exist;
-   security requirements pass;
-   relevant edge cases are handled;
-   unit/API/integration tests exist;
-   acceptance criteria pass;
-   documentation and cross-links are updated.

## 64.1 Definition of Feature Complete

``` text
Feature Requirement
       ↓
Frontend
       ↓
API
       ↓
Backend Logic
       ↓
Database
       ↓
Security
       ↓
Tests
       ↓
Acceptance
```

No feature should be considered complete merely because its UI renders.

------------------------------------------------------------------------

# 65. Product State Machines

## 65.1 Connection

``` text
PENDING
├── ACCEPTED
├── REJECTED
└── CANCELLED

ACCEPTED
└── BLOCKED
```

Only authorized actors may execute each transition.

## 65.2 Collaboration

``` text
DRAFT
 ↓
REQUESTED
 ├── DECLINED
 └── NEGOTIATING
        ↓
     ACCEPTED
        ↓
      ACTIVE
      ├── COMPLETED
      └── CANCELLED
```

The final implementation may support additional transitions only when
explicitly documented.

## 65.3 Account / Business Status

The exact enum values must follow the final schema, but frontend/API
behavior must distinguish active from inactive/suspended entities and
prevent unauthorized actions on suspended resources.

------------------------------------------------------------------------

# 66. End-to-End Traceability Matrix

  ----------------------------------------------------------------------------------------------------------------------
  Product         Frontend            API / Backend    Database                    Security               Analytics /
  Capability                                                                                              Test
  --------------- ------------------- ---------------- --------------------------- ---------------------- --------------
  Registration    `/register`         Auth register    `users`                     bcrypt/rate limits     Auth tests

  Business setup  Profile/setup       Businesses       `businesses`,               Business authz         Integration
                                                       `business_members`                                 tests

  Offers          Service UI          Services API     `services`                  Business permission    Feature tests

  Needs           Need UI             Needs API        `needs`                     Business permission    Matching tests

  Discovery       `/discover`         Discovery API    business/service/category   Visibility             Search tests
                                                       indexes                                            

  Matching        `MatchCard`         Matching service `matches` + source entities Visibility             Rule tests

  Connections     Connections UI      Connections API  `connections`               Relationship authz     Concurrency
                                                                                                          tests

  Messaging       `/messages`         Messages API     `messages`                  Participant authz      API/security
                                                                                                          tests

  Collaboration   `/collaborations`   Collaboration    collaboration tables        Participant/business   Transaction
                                      API                                          authz                  tests

  Reviews         Review UI           Reviews API      `reviews`                   Eligibility            Review tests

  Trust           Business profile    Business/trust   relevant trust entities     Visibility             Data
                                      APIs                                                                validation

  Admin           `/admin`            Admin API        reports/activity/etc.       Admin RBAC             Security tests

  Analytics       Dashboard/report    Reporting        current-state reporting     Access control         Power BI
                  surfaces            APIs/views as    structures                                         validation
                                      applicable                                                          
  ----------------------------------------------------------------------------------------------------------------------

This matrix must remain synchronized as later implementation artifacts
are created.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [02 --- Frontend](./02-frontend.md)
-   [03 --- Backend and API](./03-backend-and-api.md)
-   [04 --- Database](./04-database.md)
-   [05 --- Security](./05-security.md)
-   [07 --- Power BI and Analytics](./07-powerbi-and-analytics.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
-   [09 --- Roadmap, Traceability and
    Deployment](./09-roadmap-traceability-and-deployment.md)
