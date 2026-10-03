# BizLink Product Requirements Document --- 03 Backend and API

> **Document Group:** Sections 18--19, 25--28, 51\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final

------------------------------------------------------------------------

# 18. Backend Architecture

## 18.1 Backend Technology

The backend uses:

-   Node.js;
-   Express.js;
-   REST APIs;
-   `mysql2`;
-   MySQL;
-   JWT authentication;
-   bcrypt password hashing.

The backend is the authoritative enforcement layer for authentication,
authorization, validation, business rules, persistence, and
security-sensitive behavior.

The frontend must never connect directly to MySQL.

## 18.2 Request Processing Pipeline

Every protected request should follow this logical pipeline:

``` text
HTTP Request
    ↓
Route
    ↓
Middleware
    ↓
Authentication
    ↓
Authorization
    ↓
Request Validation
    ↓
Controller
    ↓
Service / Business Logic
    ↓
Repository / Data Access
    ↓
mysql2
    ↓
MySQL
    ↓
Response Mapping
    ↓
HTTP Response
```

Route handlers must not contain substantial business logic or raw
database implementation.

## 18.3 Proposed Backend Structure

**Recommended Design Decision:**

``` text
backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middleware/
│   ├── validators/
│   ├── models/
│   ├── db/
│   ├── utils/
│   ├── config/
│   ├── errors/
│   ├── tests/
│   └── server.js
├── package.json
└── .env.example
```

### Responsibility Boundaries

  Layer            Responsibility
  ---------------- -----------------------------------------
  Routes           HTTP endpoint mapping
  Middleware       Cross-cutting request processing
  Authentication   Identity/token verification
  Authorization    Permission enforcement
  Validators       Input contract validation
  Controllers      Request/response orchestration
  Services         Business rules and use cases
  Repositories     Database access
  Models           Data/domain representation where useful
  DB               Pool/connection/transaction handling
  Utils            Small reusable utilities
  Config           Environment/application configuration
  Errors           Standardized application errors
  Tests            Unit/integration/API tests

## 18.4 Route Handlers

A route handler should be thin.

Preferred:

``` text
route
  → middleware
  → controller
  → service
  → repository
```

Avoid:

``` text
route
  → validation + business rules + SQL + response construction
```

Business rules belong in services or dedicated domain logic.

## 18.5 Database Access

All SQL access must use parameterized queries through `mysql2`.

Do not construct SQL using unsafe string concatenation with
user-controlled values.

Database access must be centralized sufficiently to support:

-   consistent connection handling;
-   transaction boundaries;
-   error mapping;
-   testing;
-   query observability;
-   connection pooling.

## 18.6 Authentication

Authentication uses JWT.

Passwords use bcrypt hashing.

The system must never store passwords in plaintext or using reversible
encryption.

Authentication must define:

-   registration;
-   login;
-   logout;
-   token lifecycle;
-   refresh behavior where used;
-   password reset;
-   account status;
-   session expiry;
-   token revocation behavior where supported;
-   brute-force/rate-limit behavior.

Detailed security requirements are in
[`05-security.md`](./05-security.md).

## 18.7 Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> Is this authenticated user allowed to perform this operation against
> this resource?

BizLink must enforce authorization at multiple levels where applicable:

-   user-level;
-   business-level;
-   role-level;
-   resource ownership;
-   membership;
-   administrator privileges.

Suggested business roles include:

``` text
OWNER
PARTNER
ADMIN
```

`ADMIN` is platform-level authority and must not be treated as an
ordinary business membership role.

## 18.8 Validation

Validation is required at the API boundary and must be repeated or
enforced in the business/database layers wherever correctness depends on
it.

Validation should cover:

-   required fields;
-   data types;
-   lengths;
-   formats;
-   enumerations;
-   ranges;
-   relationships;
-   ownership;
-   state transitions;
-   cross-field rules.

Client-side validation is not sufficient.

## 18.9 Error Architecture

The backend should map expected application failures to standardized
error responses.

Required HTTP categories include:

    Status Meaning
  -------- --------------------------------
       400 Bad request
       401 Authentication required/failed
       403 Authenticated but unauthorized
       404 Resource not found
       409 Resource/state conflict
       422 Validation failure
       429 Rate limit exceeded
       500 Unexpected server error

Standard shape:

``` json
{
  "success": false,
  "error": {
    "code": "BUSINESS_NOT_FOUND",
    "message": "Business not found"
  }
}
```

Error responses must not expose:

-   SQL errors;
-   stack traces;
-   filesystem paths;
-   secret values;
-   internal infrastructure details;
-   raw database connection errors.

## 18.10 Logging

The backend should provide structured logging for:

-   application errors;
-   authentication failures;
-   authorization failures where operationally useful;
-   security events;
-   administrator actions;
-   significant business workflow events;
-   unexpected database failures.

Never log:

-   passwords;
-   raw authentication tokens;
-   secret keys;
-   sensitive credential material.

------------------------------------------------------------------------

# 19. API Architecture

## 19.1 API Versioning

Every endpoint uses:

``` text
/api/v1/
```

Example:

``` text
GET /api/v1/businesses
GET /api/v1/businesses/:id
POST /api/v1/connections
GET /api/v1/messages
```

## 19.2 API Contract Requirements

Every endpoint specification must define:

-   API ID;
-   feature;
-   endpoint;
-   HTTP method;
-   authentication requirement;
-   authorization requirement;
-   headers;
-   path parameters;
-   query parameters;
-   request body;
-   validation;
-   database operations;
-   transaction requirement;
-   success response;
-   error responses;
-   logging;
-   security considerations;
-   frontend consumer;
-   acceptance criteria.

## 19.3 Standard Response Convention

Where appropriate, use a consistent response envelope.

Successful example:

``` json
{
  "success": true,
  "data": {}
}
```

Collection example:

``` json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

The final API contract must avoid unnecessary inconsistency between
modules.

## 19.4 API Areas

The current API surface should cover:

1.  Authentication
2.  Users
3.  Businesses
4.  Services / Offers
5.  Needs
6.  Discovery
7.  Matching
8.  Connections
9.  Messages
10. Collaborations
11. Reviews
12. Posts
13. Administration

## 19.5 Authentication API

### API-AUTH-001 --- Register

``` text
POST /api/v1/auth/register
```

Purpose: create a user account.

Requirements:

-   validate input;
-   check uniqueness;
-   hash password using bcrypt;
-   create account;
-   return safe account/session information according to the token
    lifecycle;
-   never return password/hash;
-   avoid leaking sensitive database information.

### API-AUTH-002 --- Login

``` text
POST /api/v1/auth/login
```

Requirements:

-   validate credentials;
-   verify password using bcrypt;
-   enforce account status;
-   apply brute-force/rate-limit controls;
-   issue JWT according to the approved token lifecycle;
-   return safe authentication information.

### API-AUTH-003 --- Logout

``` text
POST /api/v1/auth/logout
```

The logout implementation must align with the chosen token lifecycle. If
refresh tokens/session state are server-tracked, the applicable
refresh/session state must be invalidated.

### API-AUTH-004 --- Password Recovery

``` text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Requirements:

-   enumeration-safe responses;
-   short-lived reset mechanism;
-   secure reset token handling;
-   bcrypt hashing for replacement password;
-   invalidation of applicable prior reset state;
-   no plaintext password storage.

### API-AUTH-005 --- Current User

``` text
GET /api/v1/auth/me
```

Returns the authenticated user's safe identity and applicable business
membership context.

------------------------------------------------------------------------

# 25. Backend Module Requirements

## 25.1 Authentication Module

**Responsibility:** identity lifecycle and token/session behavior.

**Inputs:** registration credentials, login credentials, reset data.

**Outputs:** safe user/session representation.

**Dependencies:** user repository, password hashing, token service, rate
limiter, configuration.

**Validation:** authentication schemas.

**Authorization:** authentication endpoints differ according to endpoint
requirements.

**Tests:** registration, duplicate identity, login, invalid credentials,
expiry, reset, logout.

## 25.2 User Module

Responsibilities:

-   retrieve user;
-   update permitted user profile information;
-   retrieve memberships;
-   account status;
-   user-level preferences where supported.

The module must not allow ordinary users to change protected fields
without authorization.

## 25.3 Business Module

Responsibilities:

-   business creation;
-   business profile retrieval;
-   profile update;
-   membership;
-   business status;
-   ownership/member authorization.

A business update must verify membership/ownership before mutation.

## 25.4 Services / Offers Module

Responsibilities:

-   create service/offer;
-   retrieve service/offer;
-   update;
-   delete/deactivate;
-   associate with business;
-   validate category and relevant relationships.

## 25.5 Needs Module

Responsibilities:

-   create need;
-   retrieve;
-   update;
-   delete/deactivate;
-   associate with business;
-   support matching inputs.

## 25.6 Discovery Module

Responsibilities:

-   structured search;
-   filtering;
-   pagination;
-   sorting;
-   visibility rules;
-   active-status filtering;
-   safe query construction.

Discovery should avoid unbounded queries.

## 25.7 Matching Module

Current matching is rule-based.

Possible factors:

-   service/offer vs need;
-   category;
-   business type/industry;
-   location;
-   service area;
-   budget;
-   deadline;
-   collaboration preference;
-   verification;
-   active status.

The exact weighting/rules must be explicitly defined in the
implementation contract.

**Important:** a match must provide an explanation. The user should be
able to understand which criteria caused the match.

AI/ML matching is **Future Enhancement**.

## 25.8 Connections Module

Responsibilities:

-   create request;
-   list requests;
-   accept;
-   reject;
-   cancel;
-   block where supported;
-   retrieve connection state.

The service must enforce valid state transitions.

Example:

``` text
PENDING → ACCEPTED
PENDING → REJECTED
PENDING → CANCELLED
ACCEPTED → BLOCKED
```

Self-connections and duplicate active requests must be rejected.

## 25.9 Messaging Module

Responsibilities:

-   send message;
-   retrieve conversation;
-   pagination;
-   read/unread state;
-   eligibility/relationship checks;
-   report/block integration where supported.

Messaging must not allow unauthorized users to read or write another
user's conversation.

## 25.10 Collaboration Module

Responsibilities:

-   create collaboration;
-   request;
-   negotiate;
-   accept;
-   activate;
-   complete;
-   decline;
-   cancel;
-   manage participants;
-   maintain lifecycle history where supported.

Collaboration mutations that affect multiple related records must use
transactions.

## 25.11 Review Module

Responsibilities:

-   determine eligibility;
-   create review;
-   retrieve reviews;
-   moderation state where supported;
-   enforce one-per-eligible-event rules where defined.

Reviews must not be treated as an unrestricted profile-comment
mechanism.

## 25.12 Post / Opportunity Module

Responsibilities:

-   create business post;
-   retrieve;
-   update/delete where permitted;
-   publish opportunities/requirements;
-   moderation integration.

## 25.13 Administration Module

Responsibilities:

-   verification;
-   user status;
-   business status;
-   reports;
-   moderation;
-   categories;
-   activity review.

Every administrator mutation must be audited.

------------------------------------------------------------------------

# 26. API Endpoint Contract Matrix

The final implementation should maintain an endpoint registry similar to
the following.

  ------------------------------------------------------------------------------------------------------------
  API ID          Endpoint                                Method         Auth           Authorization
  --------------- --------------------------------------- -------------- -------------- ----------------------
  API-AUTH-001    `/api/v1/auth/register`                 POST           No             Registration rules

  API-AUTH-002    `/api/v1/auth/login`                    POST           No             Credential
                                                                                        verification

  API-AUTH-003    `/api/v1/auth/logout`                   POST           Yes/session    Current session

  API-AUTH-004    `/api/v1/auth/forgot-password`          POST           No             Enumeration-safe

  API-AUTH-005    `/api/v1/auth/me`                       GET            Yes            Current user

  API-BIZ-001     `/api/v1/businesses`                    POST           Yes            Business creation
                                                                                        rules

  API-BIZ-002     `/api/v1/businesses/:id`                GET            Conditional    Visibility

  API-BIZ-003     `/api/v1/businesses/:id`                PATCH          Yes            Membership/ownership

  API-SVC-001     `/api/v1/businesses/:id/services`       POST           Yes            Business permission

  API-NEED-001    `/api/v1/businesses/:id/needs`          POST           Yes            Business permission

  API-DISC-001    `/api/v1/discover/businesses`           GET            Yes            Discovery access

  API-MATCH-001   `/api/v1/matches`                       GET            Yes            Match visibility

  API-CONN-001    `/api/v1/connections`                   POST           Yes            Eligible user/business

  API-CONN-002    `/api/v1/connections/:id`               PATCH          Yes            State transition

  API-MSG-001     `/api/v1/conversations`                 GET            Yes            Participant

  API-MSG-002     `/api/v1/conversations/:id/messages`    POST           Yes            Participant

  API-COLL-001    `/api/v1/collaborations`                POST           Yes            Eligible participant

  API-COLL-002    `/api/v1/collaborations/:id`            PATCH          Yes            Participant/owner

  API-REV-001     `/api/v1/reviews`                       POST           Yes            Eligibility

  API-POST-001    `/api/v1/posts`                         POST           Yes            Business permission

  API-ADMIN-001   `/api/v1/admin/reports`                 GET            Yes            Administrator

  API-ADMIN-002   `/api/v1/admin/businesses/:id/verify`   PATCH          Yes            Administrator
  ------------------------------------------------------------------------------------------------------------

This matrix is a contract index; the final implementation must expand
every endpoint into the full contract fields defined in Section 19.2.

------------------------------------------------------------------------

# 27. Workflow and Transaction Requirements

## 27.1 Transaction Rule

Use database transactions whenever a logical operation changes multiple
records that must succeed or fail together.

Required examples include:

-   business creation + membership;
-   connection acceptance and related state changes;
-   collaboration + participants;
-   review creation when eligibility state is also mutated;
-   SCD Type 2 version update;
-   moderation state changes with dependent audit activity.

Transaction pattern:

``` text
BEGIN
  ↓
Validate
  ↓
Write primary record
  ↓
Write dependent records
  ↓
Write audit/activity event where required
  ↓
COMMIT
```

Any failure:

``` text
ROLLBACK
```

## 27.2 Business Creation

Expected logical sequence:

1.  authenticate user;
2.  validate business input;
3.  begin transaction;
4.  create business;
5.  create owner membership;
6.  write required activity event;
7.  commit;
8.  return business representation.

If any required step fails, the transaction rolls back.

## 27.3 Connection Acceptance

The service must:

1.  authenticate requester;
2.  verify request ownership/authorization;
3.  lock or otherwise safely coordinate the relevant state;
4.  verify current state;
5.  apply valid transition;
6.  persist related activity/notification where applicable;
7.  commit.

Concurrent acceptance/rejection must not produce contradictory states.

## 27.4 Collaboration Creation

A collaboration involving multiple participants must ensure:

-   all participants are eligible;
-   related business relationship is valid;
-   required business/service/need references exist;
-   status transition is valid;
-   dependent participant records are created consistently.

## 27.5 SCD Type 2 Update

Where an SCD2 structure is used:

1.  locate current row by natural key;
2.  verify there is exactly one current row;
3.  close current version;
4.  set `effective_to`;
5.  set `is_current = false`;
6.  insert new version;
7.  set new `effective_from`;
8.  leave new `effective_to` null;
9.  set `is_current = true`;
10. commit.

The exact schema must follow [`04-database.md`](./04-database.md) and
the authoritative ER schema when supplied.

------------------------------------------------------------------------

# 28. API Performance, Pagination, and Concurrency

## 28.1 Pagination

Collection endpoints should use bounded pagination.

**Recommended Design Decision:** Support page/pageSize or an equivalent
documented pagination strategy.

Avoid endpoints that return an unbounded number of:

-   businesses;
-   messages;
-   posts;
-   reviews;
-   collaborations;
-   activity events.

## 28.2 Search Performance

Search/discovery queries should:

-   use appropriate indexes;
-   select only required fields;
-   avoid N+1 query patterns;
-   use bounded result sets;
-   validate sort/filter fields against an allowlist;
-   avoid arbitrary SQL fragments from client input.

## 28.3 Connection Pooling

The backend should use a MySQL connection pool appropriate to the
documented test/deployment environment.

Pool configuration must be externalized through environment
configuration where appropriate.

## 28.4 Concurrency

State-changing endpoints must consider concurrent requests.

Relevant examples:

-   simultaneous connection acceptance;
-   duplicate connection requests;
-   collaboration state changes;
-   concurrent reviews;
-   SCD2 updates.

Use appropriate database constraints, transaction isolation, locking,
and conflict handling rather than relying only on frontend state.

------------------------------------------------------------------------

# 51. API Security and Backend Quality

## 51.1 Input Handling

Every externally supplied value is untrusted.

Validate:

-   body;
-   path parameters;
-   query parameters;
-   headers where relevant;
-   uploaded metadata;
-   state-transition requests.

## 51.2 SQL Injection Prevention

All database queries must use parameterized values.

Do not permit users to inject:

-   column names;
-   table names;
-   sort expressions;
-   raw SQL fragments.

Dynamic query construction must use server-side allowlists.

## 51.3 XSS Protection

Backend-generated content must be handled so that user-controlled text
cannot become executable script in the frontend.

Do not treat HTML from users as trusted by default.

## 51.4 CORS

CORS must use an explicit allowed-origin configuration appropriate to
the deployed frontend.

Avoid wildcard production access when credentials or sensitive APIs are
involved.

## 51.5 Rate Limiting

Rate limiting must protect high-risk endpoints, particularly:

-   registration;
-   login;
-   password recovery;
-   password reset;
-   messaging where abuse risk exists;
-   report creation where abuse risk exists.

Return `429` when applicable.

## 51.6 Enumeration Protection

Authentication and password-recovery workflows must avoid unnecessarily
revealing:

-   whether an email exists;
-   whether a private business exists;
-   internal account state.

## 51.7 Secure Configuration

Secrets and credentials must be loaded through environment/configuration
mechanisms.

Never hard-code:

-   JWT secrets;
-   database passwords;
-   API credentials;
-   object-storage credentials.

`.env.example` may contain variable names and safe placeholder values,
never real secrets.

## 51.8 API Acceptance Standard

An API feature is complete only when:

-   contract is documented;
-   authentication is correct;
-   authorization is correct;
-   input validation exists;
-   database operations are correct;
-   transaction boundary is correct where needed;
-   standardized errors are returned;
-   security controls are present;
-   logs are safe;
-   tests cover expected and failure paths;
-   frontend consumer is identified;
-   acceptance criteria pass.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [02 --- Frontend](./02-frontend.md)
-   [04 --- Database](./04-database.md)
-   [05 --- Security](./05-security.md)
-   [06 --- Features and Workflows](./06-features-and-workflows.md)
-   [07 --- Power BI and Analytics](./07-powerbi-and-analytics.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
-   [09 --- Roadmap, Traceability and
    Deployment](./09-roadmap-traceability-and-deployment.md)
