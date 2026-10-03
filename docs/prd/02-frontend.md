# BizLink Product Requirements Document --- 02 Frontend

> **Document Group:** Sections 20--24\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final

------------------------------------------------------------------------

# 20. Frontend Implementation Specification

## 20.1 Frontend Technology

The current frontend stack is:

-   React.js;
-   Vite;
-   Tailwind CSS.

The frontend is responsible for presentation, interaction, client-side
validation, local UI state, API consumption, accessibility, navigation,
and user feedback.

It must **not** communicate directly with MySQL.

The application data path is:

``` text
React
  ↓
REST API /api/v1/
  ↓
Node.js + Express
  ↓
mysql2
  ↓
MySQL
```

The frontend must consume only documented backend contracts. Business
rules that require authoritative server-side enforcement must not be
implemented solely in the browser.

## 20.2 Proposed Frontend Project Structure

**Recommended Design Decision:** Use a feature-oriented React structure
while retaining shared layers for cross-feature concerns.

``` text
frontend/
├── src/
│   ├── api/
│   │   ├── client/
│   │   ├── auth/
│   │   ├── businesses/
│   │   ├── discovery/
│   │   ├── connections/
│   │   ├── messages/
│   │   ├── collaborations/
│   │   ├── reviews/
│   │   ├── posts/
│   │   ├── admin/
│   │   └── analytics/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── feedback/
│   │   ├── business/
│   │   ├── discovery/
│   │   ├── connections/
│   │   ├── messaging/
│   │   ├── collaborations/
│   │   ├── trust/
│   │   └── admin/
│   ├── config/
│   ├── context/
│   ├── features/
│   │   ├── auth/
│   │   ├── business/
│   │   ├── discovery/
│   │   ├── connections/
│   │   ├── messaging/
│   │   ├── collaborations/
│   │   ├── reviews/
│   │   ├── posts/
│   │   └── admin/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   ├── validations/
│   └── main.jsx
├── public/
├── tests/
├── package.json
├── vite.config.*
└── tailwind.config.*
```

The exact file extension and supporting configuration may follow the
selected React project configuration.

### 20.2.1 Structural Responsibilities

  Directory        Responsibility
  ---------------- ----------------------------------------------------
  `api/`           API client and endpoint-specific request functions
  `components/`    Reusable presentational and interaction components
  `features/`      Feature-specific composition and behavior
  `pages/`         Route-level screens
  `layouts/`       Application and administrative layout structures
  `routes/`        Route definitions and guards
  `context/`       Small shared application contexts where justified
  `hooks/`         Reusable React hooks
  `validations/`   Client-side validation schemas/helpers
  `types/`         Shared frontend data types
  `utils/`         Small general-purpose utilities
  `config/`        Runtime/configuration helpers
  `assets/`        Local visual assets

Do not introduce a global state-management library merely because the
application contains multiple screens.

## 20.3 Routing

**Proposed Requirement:** The frontend should use protected and public
route groups.

Recommended route areas:

  ----------------------------------------------------------------------------
  Route                   Purpose                      Access
  ----------------------- ---------------------------- -----------------------
  `/`                     Landing/entry point          Public

  `/login`                Authentication               Public

  `/register`             Registration                 Public

  `/forgot-password`      Password recovery            Public

  `/dashboard`            Authenticated overview       Authenticated

  `/discover`             Business discovery           Authenticated

  `/business/:id`         Business evaluation/profile  Visibility-dependent

  `/connections`          Relationship management      Authenticated

  `/messages`             Messaging                    Authenticated

  `/collaborations`       Collaboration management     Authenticated

  `/opportunities`        Business                     Authenticated
                          opportunities/requirements   

  `/profile`              User/business profile        Authenticated
                          management                   

  `/settings`             Account/business settings    Authenticated

  `/admin`                Administration               Administrator
  ----------------------------------------------------------------------------

Exact route naming is a **Proposed Requirement** and may be refined when
the final implementation contracts are integrated, provided that the
product workflows and API boundaries remain intact.

## 20.4 Global Application Shell

The authenticated application should use a consistent shell containing:

-   primary navigation;
-   business/user context;
-   notification access;
-   account/settings access;
-   responsive navigation behavior;
-   page title/context;
-   main content region;
-   consistent loading/error treatment.

The shell should not force users through unnecessary intermediate
screens.

## 20.5 Major Page Specifications

### 20.5.1 Login --- `/login`

**Purpose:** Authenticate an existing user.

**Target Persona:** Business Owner, Business Representative,
Administrator.

**Components:**

-   authentication form;
-   email/identity field as defined by API;
-   password field;
-   submit action;
-   forgot-password link;
-   registration link;
-   validation messages;
-   loading state;
-   API error state.

**Data/API:** Authentication endpoint defined in
[`03-backend-and-api.md`](./03-backend-and-api.md).

**Accessibility:**

-   explicit form labels;
-   associated error messages;
-   keyboard submission;
-   visible focus;
-   accessible loading/status feedback.

**Acceptance Criteria --- UI-001**

-   GIVEN valid credentials\
    WHEN the user submits the form\
    THEN the application shows an authenticated state and routes to the
    appropriate authenticated destination.
-   GIVEN invalid credentials\
    WHEN the form is submitted\
    THEN the application shows a safe authentication error without
    exposing sensitive backend details.
-   GIVEN a request is in progress\
    WHEN the user activates submit\
    THEN duplicate submissions are prevented or safely ignored.

### 20.5.2 Registration --- `/register`

**Purpose:** Create a user account.

**Components:**

-   registration fields;
-   password requirements;
-   validation feedback;
-   submit action;
-   login link;
-   loading/error/success states.

**Validation:** Client-side validation improves UX but server-side
validation remains authoritative.

### 20.5.3 Forgot Password --- `/forgot-password`

**Purpose:** Start password recovery.

The interface must avoid unnecessary account enumeration. The success
state should use the backend's approved enumeration-safe behavior.

### 20.5.4 Dashboard --- `/dashboard`

**Purpose:** Provide an authenticated starting point.

Potential sections:

-   business context;
-   profile completeness;
-   relevant discovery entry points;
-   needs/offers summary;
-   connection activity;
-   collaboration activity;
-   notifications;
-   useful next actions.

The dashboard must remain task-oriented rather than becoming an
overloaded analytics dashboard.

### 20.5.5 Discover --- `/discover`

**Purpose:** Discover relevant businesses.

**Primary UI:**

-   search field;
-   category filter;
-   industry filter where supported;
-   location filter;
-   service/offer filter;
-   need filter where supported;
-   sorting;
-   pagination;
-   business result cards;
-   empty state;
-   loading state;
-   error state.

**Interaction Flow:**

``` text
Search / Filters
      ↓
GET /api/v1/discover/businesses
      ↓
Result List
      ↓
Business Profile
      ↓
Evaluate
      ↓
Connect / Match
```

The exact query parameters must follow the backend contract.

### 20.5.6 Business Profile --- `/business/:id`

**Purpose:** Let a user evaluate a business before initiating a
relationship.

Recommended information hierarchy:

1.  business identity;
2.  category and location;
3.  concise business description;
4.  services/offers;
5.  needs where visibility permits;
6.  verification;
7.  certifications/achievements where supported;
8.  reviews;
9.  relevant collaboration/activity evidence;
10. available relationship actions.

The page should distinguish:

-   verified status;
-   review/reputation information;
-   credibility evidence;
-   activity.

Do not collapse all information into an unexplained trust score.

### 20.5.7 Connections --- `/connections`

**Purpose:** Manage business relationships.

The interface should clearly distinguish:

-   pending;
-   accepted;
-   rejected;
-   cancelled;
-   blocked.

Available actions must depend on the current state and user's
authorization.

### 20.5.8 Messages --- `/messages`

**Purpose:** Provide in-app messaging for eligible connected users.

UI areas:

-   conversation list;
-   current conversation;
-   message history;
-   composer;
-   unread indicators;
-   timestamps;
-   loading state;
-   history-loading state;
-   empty state;
-   error state;
-   block/report actions where applicable.

The interface should not attempt to become an enterprise chat suite.

### 20.5.9 Collaborations --- `/collaborations`

**Purpose:** Manage structured business collaborations.

The UI should represent:

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

The detail view should expose participants, relevant business
relationship, related service/need where available, dates, title,
current status, completion information, and review eligibility.

### 20.5.10 Opportunities --- `/opportunities`

**Purpose:** Present business-oriented posts, requirements, and
opportunities.

Content should remain focused on:

-   requirements;
-   opportunities;
-   business announcements;
-   milestones;
-   achievements;
-   service/product updates.

Avoid generic social-feed interaction patterns that do not support
business tasks.

### 20.5.11 Profile --- `/profile`

**Purpose:** Manage user identity and relevant business representation.

The UI must distinguish user profile data from business-owned data.

### 20.5.12 Settings --- `/settings`

Potential areas:

-   account settings;
-   session/security controls;
-   notification preferences;
-   privacy/visibility controls;
-   business membership/settings where authorized.

### 20.5.13 Admin --- `/admin`

Administrator-only area.

Recommended navigation:

-   overview;
-   pending verification;
-   users;
-   businesses;
-   reports;
-   moderation;
-   categories;
-   activity/audit;
-   operational analytics.

Every admin page must enforce administrator authorization at the API
boundary as well as route/UI level.

## 20.6 Forms and Validation

Every important form should define:

-   required fields;
-   field-level validation;
-   format validation;
-   range/length constraints when specified by the API;
-   cross-field validation where required;
-   submission state;
-   server validation errors;
-   success feedback;
-   reset/cancel behavior.

Client-side validation is an interaction aid, not a security boundary.

### 20.6.1 Error Presentation

Errors should be:

-   close to the affected field where possible;
-   understandable;
-   actionable;
-   announced accessibly;
-   free from stack traces or internal implementation information.

## 20.7 Loading, Empty, and Error States

Every major page must define all three.

### Loading

Use meaningful loading indicators or skeletons. Prevent destructive
duplicate actions while requests are pending.

### Empty

Explain why the screen is empty and provide a useful next action.

Example:

> No businesses match the current filters. Try removing a filter or
> broadening the location.

### Error

Provide:

-   a concise explanation;
-   retry where appropriate;
-   a path back to a usable state.

Do not expose SQL errors, stack traces, internal paths, or secrets.

------------------------------------------------------------------------

# 21. Frontend Component Architecture

## 21.1 Reusable Component Principle

Shared components should represent stable UI responsibilities and should
not contain unrelated business logic.

Potential reusable components include:

-   `Navbar`
-   `Sidebar`
-   `BusinessCard`
-   `BusinessProfile`
-   `BusinessSearch`
-   `FilterPanel`
-   `ServiceCard`
-   `NeedCard`
-   `MatchCard`
-   `TrustBadge`
-   `VerificationBadge`
-   `ConnectionButton`
-   `ConnectionStatus`
-   `MessageList`
-   `MessageComposer`
-   `CollaborationCard`
-   `ReviewCard`
-   `NotificationItem`
-   `Modal`
-   `ConfirmationDialog`
-   `DataTable`
-   `Pagination`
-   `EmptyState`
-   `ErrorState`
-   `LoadingSkeleton`

## 21.2 Component Contract

Important reusable components should document:

  Contract Item         Requirement
  --------------------- -----------------------------------------
  Responsibility        Single clear UI responsibility
  Inputs                Explicit props/data
  Outputs               Callback/event behavior
  State                 Local state only where appropriate
  API dependency        Direct dependency should be minimized
  Validation            Defined at form/feature boundary
  Permission behavior   Actions reflect authorized capabilities
  Reuse                 Identify intended screens/features

### 21.2.1 BusinessCard

**Responsibility:** Compact representation of a discoverable business.

**Inputs:**

-   business identity;
-   category;
-   location;
-   short description;
-   verification status;
-   relevant offer/need summary;
-   available relationship state where appropriate.

**Outputs:**

-   open profile;
-   connect action where permitted;
-   match/details action where applicable.

The component should not independently determine whether a connection is
authorized. That state should come from the API/application data
contract.

### 21.2.2 MatchCard

**Responsibility:** Present a rule-based business match.

**Inputs:**

-   matched business;
-   relevance information;
-   explanation;
-   applicable match metadata.

**Output:** navigation to evaluation/profile or appropriate connection
workflow.

The explanation is mandatory to preserve match transparency.

### 21.2.3 ConnectionButton

The component should render the correct available action based on
connection state.

It must handle:

-   request;
-   pending;
-   accepted;
-   rejected;
-   cancelled;
-   blocked.

The backend remains authoritative for state transitions.

### 21.2.4 TrustBadge / VerificationBadge

Trust indicators must be semantically distinguishable. A verification
badge must not imply a review rating, and a review rating must not imply
formal verification.

------------------------------------------------------------------------

# 22. Frontend State Management

## 22.1 State Categories

The frontend must account for:

-   authentication state;
-   current user;
-   current business;
-   connection state;
-   messaging state;
-   notification state;
-   loading state;
-   search state;
-   filter state.

## 22.2 State Strategy

**Recommended Design Decision:** Prefer React's built-in state/context
mechanisms plus feature-local state and a dedicated API/data-fetching
abstraction before introducing a large global state-management library.

Use global/shared state only for data genuinely needed across unrelated
feature boundaries, such as:

-   authenticated user/session;
-   current business context;
-   global notification count;
-   stable UI preferences.

Search/filter state should generally remain local to the discovery
workflow unless cross-page persistence is explicitly required.

## 22.3 Server State

Server-owned data should not be treated as permanently authoritative
client state.

The frontend should:

1.  request data through the API client;
2.  represent loading/error/empty states;
3.  update local UI after successful mutations;
4.  refetch or reconcile data when the server state is authoritative;
5.  avoid duplicating business rules.

## 22.4 Authentication State

The authentication layer must coordinate with the backend token
lifecycle.

The frontend must handle:

-   authenticated state;
-   unauthenticated state;
-   token expiry;
-   logout;
-   refresh behavior where supported;
-   unauthorized API responses;
-   suspended/inactive account behavior.

Sensitive tokens must not be casually exposed to application UI
components.

------------------------------------------------------------------------

# 23. UX Requirements

## 23.1 Onboarding

Onboarding should minimize unnecessary steps.

A logical progression is:

``` text
Register
  ↓
Create / Join Business
  ↓
Basic Business Profile
  ↓
Offers
  ↓
Needs
  ↓
Discover
```

The exact onboarding sequence may be refined when the database and API
contracts are finalized, but the user should reach the core value of
structured discovery without unnecessary setup.

## 23.2 Navigation

Navigation should reflect the primary business workflow rather than
technical implementation details.

A recommended authenticated navigation model is:

``` text
Dashboard
Discover
Connections
Messages
Collaborations
Opportunities
Profile
Settings
```

Administrator navigation is shown separately when the user has
administrator authorization.

## 23.3 Discoverability

Important business actions should be visible where context makes them
relevant:

-   connect from a business evaluation view;
-   message from an eligible connection;
-   start collaboration from an appropriate relationship context;
-   review after an eligible collaboration;
-   manage offers/needs from the business context.

## 23.4 Search and Filtering

Search should be understandable and responsive.

Requirements:

-   clear search input;
-   identifiable active filters;
-   easy filter removal;
-   predictable sorting;
-   pagination;
-   result count where available;
-   empty-result explanation;
-   preserved filter state while navigating within discovery.

## 23.5 Feedback

User actions must receive meaningful feedback:

-   success;
-   failure;
-   pending;
-   unauthorized;
-   validation error;
-   conflict.

Do not rely exclusively on color to communicate state.

## 23.6 Confirmations

Use confirmation dialogs for actions with meaningful consequences, such
as:

-   destructive deletion;
-   business suspension where applicable;
-   irreversible moderation action;
-   cancellation of an important workflow.

Do not add confirmations to every ordinary action.

## 23.7 Keyboard Navigation

All core workflows must be usable with a keyboard.

Requirements:

-   logical tab order;
-   visible focus;
-   keyboard-operable controls;
-   no keyboard traps;
-   accessible dialogs;
-   logical escape behavior for dismissible overlays.

## 23.8 Semantic HTML

Use:

-   semantic headings;
-   landmarks;
-   buttons for actions;
-   links for navigation;
-   labels for form fields;
-   appropriate lists/tables;
-   accessible status messages.

Do not use clickable generic containers when a semantic control is
appropriate.

## 23.9 Screen Readers

Important controls must expose meaningful accessible names.

Dynamic status changes should be announced where necessary.

Form validation messages must be programmatically associated with the
corresponding input.

## 23.10 Responsive Behavior

The product must support the application's target desktop and
mobile-width layouts.

Responsive behavior must preserve:

-   primary actions;
-   information hierarchy;
-   readability;
-   navigation;
-   form usability;
-   table usability;
-   messaging usability.

Responsive design should reflow content rather than simply shrinking
every component.

------------------------------------------------------------------------

# 24. UI Design System

## 24.1 Visual Direction

The UI should communicate:

-   credibility;
-   trust;
-   business utility;
-   structured discovery;
-   professionalism.

The visual system should be restrained rather than decorative.

## 24.2 Colors

**Recommended Design Decision:** Use a restrained semantic color system
with a neutral foundation and a small set of semantic states.

Color must not be the sole indicator of:

-   verification;
-   connection status;
-   collaboration status;
-   validation;
-   errors;
-   success.

Status should be communicated through combinations of:

-   color;
-   text;
-   iconography where useful;
-   accessible labels.

## 24.3 Typography

Use a readable sans-serif type system with clear hierarchy.

Define tokens for:

-   page title;
-   section title;
-   body;
-   supporting text;
-   labels;
-   table text;
-   button text.

Avoid excessive typography variants.

## 24.4 Spacing

Use a consistent spacing scale across:

-   cards;
-   forms;
-   page sections;
-   navigation;
-   dialogs;
-   tables.

Meaningful whitespace should separate distinct tasks and information
groups.

## 24.5 Cards

Cards are appropriate for:

-   businesses;
-   matches;
-   collaborations;
-   reviews;
-   notifications.

Cards should emphasize information hierarchy rather than decoration.

## 24.6 Buttons

Button hierarchy should communicate action priority.

Use distinct treatments for:

-   primary action;
-   secondary action;
-   neutral action;
-   destructive action.

Every button must have an accessible name.

## 24.7 Tables

Use tables where structured comparison or administration benefits from
tabular presentation.

Tables must remain usable on smaller screens through:

-   responsive layout;
-   controlled horizontal scrolling;
-   priority columns;
-   or another documented responsive strategy.

## 24.8 Inputs

Inputs must provide:

-   visible labels;
-   appropriate input types;
-   clear required/optional status;
-   accessible errors;
-   focus state;
-   disabled/loading state where applicable.

## 24.9 Badges and Trust Indicators

Badges should be reserved for meaningful status or evidence.

Examples:

-   Verified;
-   Active;
-   Pending;
-   Completed;
-   Administrator.

Avoid decorative badges with no semantic value.

## 24.10 Alerts

Alerts must:

-   state what happened;
-   explain the consequence;
-   provide the next action where useful;
-   use accessible status semantics.

## 24.11 Modals and Dialogs

Dialogs should be used selectively.

Requirements:

-   focus moves into the dialog;
-   focus returns appropriately after close;
-   dialog has an accessible name;
-   keyboard dismissal works when appropriate;
-   background interaction is prevented while modal;
-   destructive actions have clear labels.

## 24.12 WCAG 2.1 AA Target

The entire frontend design system targets **WCAG 2.1 AA**.

Acceptance criteria include:

-   keyboard-only navigation works for core journeys;
-   visible focus states exist;
-   form labels and errors are correctly associated;
-   informative images have meaningful alternative text;
-   headings and landmarks are semantic;
-   text and controls meet applicable contrast requirements;
-   dialogs are keyboard and screen-reader accessible;
-   status and validation messages are accessible.

Accessibility is an implementation requirement, not merely a visual
preference.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [03 --- Backend and API](./03-backend-and-api.md)
-   [04 --- Database](./04-database.md)
-   [05 --- Security](./05-security.md)
-   [06 --- Features and Workflows](./06-features-and-workflows.md)
-   [07 --- Power BI and Analytics](./07-powerbi-and-analytics.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
-   [09 --- Roadmap, Traceability and
    Deployment](./09-roadmap-traceability-and-deployment.md)
