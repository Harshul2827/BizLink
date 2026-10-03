# BizLink Product Requirements Document --- 01 Personas and Product

> **Document Group:** Sections 13--17\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final

------------------------------------------------------------------------

# 13. Problem Definition

## 13.1 Referral Dependency

Businesses frequently rely on personal contacts, referrals,
word-of-mouth, friends, family, and existing professional networks to
identify potential customers, suppliers, service providers, vendors,
partners, consultants, and collaborators.

This creates a dependency on the reach and quality of an organization's
existing network. BizLink addresses the product problem by introducing
structured business discovery in which businesses explicitly describe
their identity, offerings, requirements, and collaboration interests.

**FR-DISC-001 --- Structured Business Discovery**

The system shall provide a structured mechanism for discovering
businesses using information represented within BizLink rather than
requiring a pre-existing personal relationship.

**Acceptance Criteria**

-   GIVEN an authenticated user with access to discovery\
    WHEN the user performs a business discovery request\
    THEN the system returns businesses matching the permitted structured
    criteria.
-   GIVEN a user with no existing relationship to a business\
    WHEN that business satisfies the discovery criteria\
    THEN the business may appear in discovery results subject to
    visibility and status rules.

## 13.2 Limited Networks

A business can be unable to identify an appropriate provider or partner
simply because that business is outside its immediate network.

BizLink therefore treats the business directory and structured discovery
experience as a mechanism for widening the discoverable set without
requiring an existing connection.

The product must not imply that discovery guarantees successful
commercial relationships. Discovery is an enabling mechanism;
evaluation, connection, and collaboration remain separate stages.

## 13.3 Cross-Domain Discovery

Businesses may require services from domains that differ from their own.
A veterinary clinic, for example, may need commercial HVAC maintenance
while having no direct connection to an HVAC provider.

The platform should therefore represent offers and needs independently
enough to support cross-domain discovery and rule-based matching.

**FR-DISC-002 --- Cross-Domain Discovery**

The system shall allow businesses to discover other businesses whose
structured offers or services satisfy relevant needs, even when the
businesses operate in different business categories.

## 13.4 Difficulty Evaluating Businesses

Finding a business is not sufficient. A user also needs enough
information to determine whether a potential business relationship is
worth pursuing.

Evaluation may include:

-   business profile information;
-   services/offers;
-   needs;
-   categories;
-   verification;
-   certifications;
-   achievements;
-   reviews;
-   recommendations where supported;
-   successful collaborations;
-   relevant account/activity information;
-   reported incidents where relevant and appropriately controlled.

The system must distinguish evidence types rather than collapsing all
trust information into an arbitrary score.

## 13.5 Fragmented Discovery

Traditional discovery may require switching between search engines,
referrals, social networks, business directories, messaging channels,
and private conversations.

BizLink aims to provide a structured product flow from discovery through
relationship formation:

``` text
Search / Filter
     ↓
Business Profile
     ↓
Trust / Credibility Evidence
     ↓
Match / Relevance
     ↓
Connection
     ↓
Messaging
     ↓
Collaboration
```

The product should minimize unnecessary context switching.

## 13.6 Lack of Structured Offers and Needs

A central product distinction is the separation of:

-   what a business **OFFERS**;
-   what a business **NEEDS**.

This enables discovery and matching to operate on explicit business
information rather than relying solely on free-form profile
descriptions.

**FR-BIZ-001 --- Structured Offers**

A business with appropriate permissions shall be able to create,
maintain, and present structured service/offer information.

**FR-BIZ-002 --- Structured Needs**

A business with appropriate permissions shall be able to create,
maintain, and present structured needs.

## 13.7 Lack of Collaboration Workflow

A discovery result should be capable of progressing into a structured
relationship.

BizLink therefore includes:

-   connection requests;
-   messaging after the appropriate connection condition;
-   collaboration requests;
-   collaboration participants;
-   collaboration lifecycle;
-   completion;
-   review.

Collaboration is not merely a message thread. It is a business workflow
with state and history.

## 13.8 Weak Business Relationship History

The platform should preserve relevant relationship information through:

-   connection state;
-   message history subject to retention rules;
-   collaboration history;
-   collaboration participants;
-   reviews;
-   activity events.

This provides a structured record of business interactions while
avoiding unnecessary enterprise CRM complexity.

## 13.9 Limited Business Analytics

BizLink includes Power BI as a required analytics deliverable.

Analytics must use curated current-state reporting structures. SCD Type
2 historical/audit structures are explicitly excluded from the Power BI
data model.

Relevant analytics areas include:

-   platform overview;
-   discovery;
-   matching;
-   collaboration;
-   trust;
-   engagement;
-   growth.

------------------------------------------------------------------------

# 14. Target Users and Personas

## 14.1 Persona 1 --- Business Owner

### Role

The Business Owner is the primary product persona. This user establishes
and represents a business, manages its profile, controls business
information, publishes offers and needs, evaluates other businesses,
establishes connections, and participates in collaborations.

### Objectives

-   establish a credible business presence;
-   make the business discoverable;
-   communicate what the business offers;
-   communicate what the business needs;
-   identify relevant businesses;
-   evaluate credibility before connecting;
-   establish useful business relationships;
-   manage collaborations;
-   build credibility through legitimate evidence.

### Pain Points

-   dependence on personal referrals;
-   limited visibility outside an existing network;
-   difficulty identifying relevant providers;
-   fragmented business discovery;
-   insufficient structured information for evaluation;
-   lack of a clear path from discovery to collaboration.

### Common Tasks

1.  Register.
2.  Create or join a business.
3.  Complete the business profile.
4.  Publish services/offers.
5.  Publish needs.
6.  Search and filter businesses.
7.  Review business profiles.
8.  Evaluate trust evidence.
9.  Review rule-based matches.
10. Send or respond to connection requests.
11. Message connected businesses.
12. Initiate or participate in collaborations.
13. Complete collaborations.
14. Submit or receive eligible reviews.
15. Manage profile and business settings.

### Permissions

The Business Owner receives business-level authority defined by the
finalized authorization model. Ownership does not automatically grant
administrator permissions.

At minimum, ownership should govern permitted operations over the
business profile and its business-owned resources.

### Information Needs

-   business identity;
-   categories;
-   location;
-   services/offers;
-   needs;
-   collaboration preferences;
-   verification status;
-   certifications;
-   achievements;
-   reviews;
-   relationship status;
-   collaboration status.

### Security Concerns

-   protection of account credentials;
-   protection of private business information;
-   business-resource ownership;
-   unauthorized business-member access;
-   token/session security;
-   visibility controls.

### Expected UX

The primary user should be able to complete the main business tasks
without unnecessary navigation:

``` text
Create Profile
Publish Offer
Create Need
Discover Business
Evaluate Business
Connect
Message
Collaborate
Review
```

## 14.2 Persona 2 --- Business Partner / Business Representative

### Role

A Business Partner or Business Representative acts on behalf of a
business subject to the permissions assigned to the user's business
membership.

The product must distinguish user-level identity from business-level
authority.

### Objectives

-   perform authorized business tasks;
-   maintain business information where permitted;
-   manage services and needs where permitted;
-   participate in discovery;
-   communicate with connected businesses;
-   participate in collaborations;
-   maintain accurate business information.

### Responsibilities

Responsibilities depend on membership permissions. A representative must
not automatically receive owner-level authority.

### Common Tasks

-   view and edit permitted business information;
-   manage permitted services/offers;
-   manage permitted needs;
-   participate in connections;
-   participate in messaging;
-   participate in collaborations;
-   perform other authorized business tasks.

### Permissions

Permissions must be enforced at the business-resource level, not merely
based on whether the user is authenticated.

**FR-AUTHZ-001 --- Business-Level Authorization**

The system shall evaluate whether an authenticated user has permission
to perform an operation against a specific business resource.

### Security Concerns

-   least privilege;
-   resource ownership;
-   membership changes;
-   removal of access;
-   unauthorized access through direct API requests.

### Expected UX

The interface should show only actions available to the current member.
Unauthorized actions should not be presented as if they were available.

## 14.3 Persona 3 --- Administrator

### Role

The Administrator is a privileged platform-level persona responsible for
operational governance rather than normal business networking.

### Objectives

-   verify businesses;
-   manage users and business status;
-   review reports;
-   moderate content;
-   manage categories where permitted;
-   monitor activity;
-   perform administrative actions;
-   support platform trust and safety;
-   access authorized analytics.

### Responsibilities

-   business verification;
-   user management;
-   suspension/inactivation;
-   content moderation;
-   report resolution;
-   category administration;
-   audit/activity review;
-   platform analytics.

### Permissions

Administrator privileges must be isolated from normal business-owner
permissions.

**FR-ADMIN-001 --- Administrator Isolation**

Administrator endpoints and administrative UI must require explicit
administrator authorization.

### Security Concerns

Administrator actions have elevated impact and therefore require:

-   explicit authorization;
-   audit logging;
-   controlled access;
-   safe error handling;
-   no disclosure of confidential moderation information to normal
    users.

### Expected UX

The admin experience should be information-dense enough for operational
work but remain consistent with the overall restrained business-oriented
design language.

## 14.4 Business Staff and Membership

The product must support the concept that a business may have multiple
users acting on its behalf.

The distinction is:

``` text
User Identity
     ↓
Business Membership
     ↓
Business-Level Role / Permission
     ↓
Business Resource
```

This prevents the application from treating every authenticated user as
globally authorized to manipulate every business.

------------------------------------------------------------------------

# 15. Product Objectives

## 15.1 Business Objectives

  -----------------------------------------------------------------------
  ID                      Objective               Observable Outcome
  ----------------------- ----------------------- -----------------------
  OBJ-BIZ-001             Improve business        Businesses can be found
                          discovery               through structured
                                                  discovery

  OBJ-BIZ-002             Reduce referral         Users can discover
                          dependency              businesses outside
                                                  existing personal
                                                  networks

  OBJ-BIZ-003             Structure offers and    Business capabilities
                          needs                   and requirements are
                                                  represented explicitly

  OBJ-BIZ-004             Improve credibility     Users can inspect trust
                          evaluation              and business evidence
                                                  before connecting

  OBJ-BIZ-005             Facilitate business     Discovery can progress
                          relationships           into connections and
                                                  collaborations

  OBJ-BIZ-006             Preserve relationship   Connections,
                          history                 collaborations,
                                                  reviews, and relevant
                                                  activity remain
                                                  structured

  OBJ-BIZ-007             Support analytics       Current-state business
                                                  activity can be
                                                  analyzed through Power
                                                  BI
  -----------------------------------------------------------------------

## 15.2 User Objectives

### Business Owner

-   find relevant businesses;
-   present the business professionally;
-   identify potential service providers, partners, suppliers, or
    collaborators;
-   evaluate businesses before connecting;
-   form and manage business relationships.

### Business Representative

-   complete authorized tasks efficiently;
-   maintain accurate business information;
-   participate in business workflows without excessive permissions.

### Administrator

-   maintain platform integrity;
-   verify businesses;
-   resolve reports;
-   manage platform entities and activity;
-   monitor platform-level metrics.

## 15.3 Product Objectives

**FR-DISC-003 --- Structured Discovery**

Provide business discovery based on structured business data, search,
filters, and relevant matching.

**FR-TRUST-001 --- Trust Evidence**

Present trust evidence in distinguishable forms including verification,
reputation, credibility evidence, and activity.

**FR-CONN-001 --- Relationship Formation**

Provide an explicit connection workflow with controlled lifecycle
states.

**FR-COLL-001 --- Collaboration Workflow**

Provide a structured collaboration lifecycle from request through
completion or termination.

**FR-ANL-001 --- Analytics**

Provide analytics through curated current-state reporting structures
consumed by Power BI.

## 15.4 Technical Objectives

-   maintain clear frontend/backend/database boundaries;
-   expose versioned REST APIs;
-   keep business logic out of route handlers;
-   use MySQL as the operational database;
-   use parameterized database access;
-   enforce authentication and authorization;
-   provide deterministic rule-based matching;
-   maintain testable modules;
-   preserve schema integrity;
-   support the sequential build and approval process.

------------------------------------------------------------------------

# 16. Product Scope

## 16.1 Current MVP Scope

The current implementation scope includes:

### Identity and Access

-   registration;
-   login;
-   logout;
-   password recovery;
-   user profiles;
-   authentication;
-   authorization;
-   business membership.

### Business Representation

-   business profiles;
-   categories;
-   services/offers;
-   business needs.

### Discovery

-   business search;
-   filtering;
-   discovery;
-   rule-based matching;
-   explainable match results.

### Relationships

-   connection requests;
-   connection states;
-   in-app messaging;
-   collaborations;
-   collaboration participants;
-   collaboration lifecycle;
-   collaboration history.

### Trust and Content

-   reviews;
-   verification;
-   certifications/achievements where represented by the source schema;
-   trust indicators;
-   business posts;
-   opportunities/requirements;
-   reports;
-   activity events.

### Administration

-   business verification;
-   user management;
-   content moderation;
-   reports;
-   suspension/status management;
-   categories;
-   activity monitoring;
-   audit-related behavior;
-   analytics.

### Analytics

-   MySQL operational data;
-   curated current-state reporting structures;
-   Power BI data model;
-   Power BI dashboards;
-   secure Power BI Service publication.

## 16.2 Current Scope Boundaries

### Rule-Based Matching Is Current

Matching is deterministic and rule-based.

Potential factors include:

-   offer vs need;
-   category;
-   industry;
-   service;
-   location;
-   service area;
-   budget;
-   deadline;
-   collaboration preference;
-   verification;
-   active status.

Every generated match must be explainable.

### AI/ML Is Future Scope

The current version must not implement AI/ML matching.

Future possibilities include:

-   semantic matching;
-   natural-language search;
-   intelligent recommendations;
-   opportunity matching;
-   AI-generated insights.

These are **Future Enhancements**, not current implementation
requirements.

### Financial Information

Businesses may optionally showcase high-level growth trends, milestones,
and achievements under privacy controls. BizLink is not a financial
reporting platform and must not require detailed financial statements.

## 16.3 Scope Discipline

A feature should enter current scope only when it supports a useful
business task and can be specified consistently across frontend, API,
backend, database, security, testing, and analytics where applicable.

Avoid adding functionality merely because it is technically possible.

------------------------------------------------------------------------

# 17. Feature Requirements

For every major feature, the detailed specification must define:

-   feature ID;
-   feature name;
-   purpose;
-   target user;
-   preconditions;
-   trigger;
-   main workflow;
-   alternate workflow;
-   validation;
-   permissions;
-   database impact;
-   API impact;
-   frontend impact;
-   loading state;
-   empty state;
-   error state;
-   security considerations;
-   edge cases;
-   acceptance criteria.

The following requirements establish the product-level contract.
Detailed API, database, frontend, security, and workflow contracts are
defined in the later section-group files.

## 17.1 Registration

**FR-AUTH-001 --- User Registration**

The system shall allow an eligible user to create an account using the
authentication workflow defined by the backend specification.

**Preconditions**

-   user is not already registered with the same unique identity;
-   registration data passes validation.

**Acceptance Criteria**

-   duplicate identity is rejected safely;
-   password is never stored reversibly;
-   successful registration creates the required identity state;
-   invalid input produces a standardized validation response;
-   sensitive implementation details are not exposed.

## 17.2 Authentication

**FR-AUTH-002 --- Login**

The system shall authenticate valid credentials using JWT-based
authentication and bcrypt password verification.

**Acceptance Criteria**

-   valid credentials result in an authenticated session/token according
    to the approved token lifecycle;
-   invalid credentials do not reveal whether a particular account
    exists beyond the defined enumeration-protection behavior;
-   rate limiting/brute-force controls apply where required.

## 17.3 Business Profile

**FR-BIZ-001 --- Business Profile Management**

An authorized business member shall be able to create and maintain
business profile information supported by the database contract.

**Acceptance Criteria**

-   only authorized members can modify protected business fields;
-   profile validation is enforced;
-   business status affects visibility and permitted operations;
-   changes are persisted through the backend rather than direct
    frontend database access.

## 17.4 Services / Offers

**FR-BIZ-002 --- Service and Offer Management**

An authorized business member shall be able to create, view, update, and
remove applicable service/offer records.

The detailed lifecycle and exact fields must follow the authoritative ER
schema when available.

## 17.5 Needs

**FR-BIZ-003 --- Business Need Management**

An authorized business member shall be able to create, view, update, and
remove applicable business needs.

Needs are first-class inputs to discovery and matching.

## 17.6 Discovery

**FR-DISC-001 --- Business Discovery**

Users shall be able to discover businesses using structured search and
filters.

Discovery must support appropriate loading, empty, error, pagination,
and authorization behavior.

## 17.7 Matching

**FR-MATCH-001 --- Explainable Rule-Based Matching**

The system shall generate deterministic matches using the approved rule
set.

Each match shall expose an explanation sufficient for the user to
understand why the result is relevant.

AI/ML matching is excluded from this requirement.

## 17.8 Connections

**FR-CONN-001 --- Business Connection**

The system shall allow eligible users/businesses to create and manage
connection relationships using the defined states:

``` text
PENDING
ACCEPTED
REJECTED
CANCELLED
BLOCKED
```

The system shall prevent self-connections, duplicate active requests,
and unauthorized state transitions.

## 17.9 Messaging

**FR-MSG-001 --- Connected-Business Messaging**

Messaging shall be available subject to the product's connection
requirement and authorization rules.

The messaging system shall support:

-   message creation;
-   retrieval;
-   ordering;
-   unread/read state;
-   timestamps;
-   blocking/reporting integration;
-   moderation/retention behavior.

## 17.10 Collaborations

**FR-COLL-001 --- Collaboration Lifecycle**

Collaborations shall use the defined lifecycle:

``` text
DRAFT
REQUESTED
NEGOTIATING
ACCEPTED
ACTIVE
COMPLETED
DECLINED
CANCELLED
```

The collaboration model must support participants, initiating
relationship, related need/service where applicable, dates, title,
status, completion, and review linkage according to the database
contract.

## 17.11 Reviews

**FR-REV-001 --- Eligible Business Reviews**

The system shall allow eligible users to submit reviews according to
review eligibility and moderation rules.

Reviews may include:

-   rating;
-   title;
-   content where supported;
-   collaboration linkage.

Review eligibility must not be based solely on being able to access
another business's profile.

## 17.12 Verification and Trust

**FR-TRUST-001 --- Trust Evidence**

The system shall distinguish:

1.  Verification
2.  Reputation
3.  Credibility Evidence
4.  Activity

Possible evidence includes:

-   verification;
-   certifications;
-   achievements;
-   reviews;
-   recommendations;
-   successful collaborations;
-   profile completeness;
-   account history;
-   relevant reported incidents.

The product must not display an arbitrary trust score unless the
calculation is explicitly defined and supported.

## 17.13 Posts and Opportunities

**FR-BIZ-004 --- Business-Oriented Posts**

Posts shall support business communication such as:

-   announcements;
-   milestones;
-   business updates;
-   opportunities;
-   requirements;
-   achievements;
-   service/product updates.

Posts must not turn the product into a generic social-media feed.

## 17.14 Administration

**FR-ADMIN-001 --- Platform Administration**

Authorized administrators shall be able to perform defined platform
operations including:

-   verification;
-   user management;
-   moderation;
-   report handling;
-   suspension;
-   business status management;
-   category management;
-   activity monitoring;
-   audit-related operations;
-   analytics access.

## 17.15 Notifications

**FR-ANL-002 --- In-App Notifications**

The system shall provide lightweight in-app notifications for important
events such as:

-   connection request;
-   connection accepted;
-   message;
-   collaboration request;
-   collaboration accepted;
-   review received;
-   verification result;
-   important administrative events.

Notifications must support unread/read state and appropriate user
preferences.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
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
