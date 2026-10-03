# BizLink Product Requirements Document --- 05 Security

> **Document Group:** Sections 52--54, 57\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final

------------------------------------------------------------------------

# 52. Application Security

## 52.1 Security Objectives

BizLink must protect:

-   user accounts;
-   passwords;
-   authentication tokens;
-   business information;
-   private business data;
-   messages;
-   collaboration information;
-   reviews;
-   uploaded files;
-   administrator capabilities;
-   database integrity;
-   audit/activity information.

Security must be enforced at the backend and database boundaries, not
only through frontend UI behavior.

## 52.2 Authentication

The authentication model uses JWT.

Requirements:

-   secure credential validation;
-   bcrypt password hashing;
-   token expiry;
-   appropriate refresh lifecycle if refresh tokens are used;
-   logout behavior;
-   password recovery;
-   account status enforcement;
-   brute-force protection;
-   rate limiting.

Passwords must never be:

-   stored plaintext;
-   logged;
-   returned by APIs;
-   encrypted reversibly as a substitute for hashing.

## 52.3 Password Hashing

Passwords must use bcrypt.

The distinction is:

### Hashing

A one-way transformation used for password verification.

``` text
Password
   ↓
bcrypt
   ↓
Password Hash
```

The application verifies a submitted password against the stored hash;
it does not decrypt a stored password.

### Encryption

A reversible transformation used where the application must recover the
original data.

Passwords do not require reversible storage and must not be stored that
way.

## 52.4 JWT Security

JWT implementation must define:

-   signing algorithm;
-   secret/key configuration;
-   expiry;
-   issuer/audience validation where used;
-   token extraction;
-   invalid-token behavior;
-   expired-token behavior;
-   refresh behavior if used;
-   logout/revocation behavior where applicable.

Secrets must be supplied through secure environment/configuration
mechanisms.

## 52.5 Session and Token Lifecycle

The implementation must explicitly define:

1.  login;
2.  access-token issuance;
3.  access-token expiry;
4.  refresh-token issuance if applicable;
5.  refresh-token rotation/invalidation if applicable;
6.  logout;
7.  password reset;
8.  account suspension;
9.  token rejection after required revocation conditions.

A suspended or inactive account must not remain indefinitely authorized
merely because an old token exists.

## 52.6 Authorization

Authorization must exist at:

-   platform level;
-   user level;
-   business membership level;
-   resource level.

The backend must verify the resource relationship on every sensitive
operation.

Example:

``` text
Authenticated User
       ↓
Member of Business?
       ↓
Has Required Role/Permission?
       ↓
Owns / Can Modify Resource?
       ↓
Allow
```

Never assume:

``` text
JWT valid → all business actions allowed
```

## 52.7 Role-Based Access Control

Suggested role concepts:

-   `OWNER`
-   `PARTNER`
-   `ADMIN`

Roles are not sufficient by themselves when resource ownership matters.

For example, a `PARTNER` belonging to Business A should not be able to
modify Business B merely because the role name is valid.

## 52.8 Business-Level Authorization

Business-level permissions must cover operations such as:

-   profile modification;
-   service creation/update/deletion;
-   need creation/update/deletion;
-   business post creation;
-   collaboration actions where business authorization is required;
-   member management where supported.

## 52.9 Input Validation

Validate:

-   body parameters;
-   query parameters;
-   path parameters;
-   enumerations;
-   identifiers;
-   text lengths;
-   dates;
-   numeric ranges;
-   state transitions;
-   file metadata.

Never trust client-side validation.

## 52.10 SQL Injection Prevention

All database queries must use parameterized queries.

Unsafe pattern:

``` text
SQL string + user input
```

Required pattern:

``` text
Parameterized SQL + bound values
```

Dynamic ordering/filtering must use server-side allowlists rather than
arbitrary SQL expressions.

## 52.11 XSS Protection

User-controlled content must not become executable HTML/JavaScript.

Frontend rendering must escape untrusted text by default.

If rich text is ever introduced, it requires explicit sanitization and a
documented allowed-content policy.

## 52.12 CSRF

The implementation must evaluate CSRF exposure based on the selected
authentication transport.

If authentication uses cookies, appropriate CSRF defenses are required.

If bearer tokens are used in an authorization header and are not
automatically attached by the browser as cookies, CSRF exposure differs,
but XSS and token protection remain critical.

The final authentication transport must be documented before security
sign-off.

## 52.13 CORS

CORS must use explicit allowed origins appropriate to deployment.

Do not use unrestricted wildcard CORS for sensitive authenticated APIs.

## 52.14 Secure HTTP Headers

The production deployment should apply appropriate security headers,
including protections for:

-   content type sniffing;
-   clickjacking;
-   transport security;
-   content security where configured;
-   referrer behavior.

Exact header configuration must be tested against the frontend.

## 52.15 Rate Limiting

Rate limiting is required for abuse-sensitive operations, especially:

-   login;
-   registration;
-   password recovery;
-   password reset;
-   message submission where abuse is possible;
-   report creation where abuse is possible.

The response should use `429 Too Many Requests` when a configured limit
is exceeded.

## 52.16 Brute-Force Protection

Repeated authentication failures must trigger an appropriate protection
strategy.

The system should:

-   rate-limit attempts;
-   avoid account enumeration;
-   avoid revealing whether an identity exists;
-   record security-relevant failure events.

A hard permanent lockout should not be introduced without a recovery
strategy.

------------------------------------------------------------------------

# 53. Privacy and Data Protection

## 53.1 Data Categories

BizLink may contain:

### Personal Data

-   user identity;
-   contact information;
-   authentication-related account state;
-   membership relationships.

### Business Data

-   business profile;
-   services;
-   needs;
-   location;
-   certifications;
-   achievements;
-   business updates;
-   opportunities.

### Relationship Data

-   connections;
-   messages;
-   collaborations;
-   collaboration participants;
-   reviews.

### Administrative Data

-   reports;
-   moderation actions;
-   activity events;
-   verification decisions.

## 53.2 Data Minimization

Collect only information required for:

-   product functionality;
-   security;
-   legal/operational obligations where applicable;
-   analytics that are explicitly required.

Do not collect sensitive information merely because it may be
technically useful later.

## 53.3 Visibility Controls

The implementation must distinguish information that is:

-   public/discoverable;
-   authenticated-user visible;
-   connection-only;
-   business-member-only;
-   administrator-only;
-   private.

Visibility must be enforced by backend authorization and not merely
hidden in the UI.

## 53.4 Business Profile Visibility

A business may have information intended for discovery and information
intended for restricted business members.

The API must return only information the requesting user is permitted to
see.

## 53.5 Messaging Privacy

Messages must be accessible only to authorized conversation participants
and authorized administrative processes.

Administrators must not receive unrestricted message access merely
because they have an admin role unless the product's approved
moderation/privacy model explicitly grants it.

## 53.6 Data Retention

Retention rules must be documented for:

-   accounts;
-   business profiles;
-   messages;
-   collaborations;
-   reviews;
-   reports;
-   activity events;
-   uploaded files.

Where the product does not define a retention period, label the value a
**Recommended Design Decision** rather than inventing a mandatory legal
retention requirement.

## 53.7 Account Deletion

Account deletion must define:

-   what is deleted;
-   what is anonymized;
-   what must be retained for relationship/history integrity;
-   what happens to business memberships;
-   what happens to reviews;
-   what happens to messages;
-   what happens to activity/audit records.

The final behavior must be consistent with the database lifecycle
design.

## 53.8 Privacy and Analytics

Power BI reporting must use only data approved for reporting.

SCD Type 2 history and audit-only structures are excluded from the Power
BI model.

## 53.9 Administrative Access

Administrator access must be:

-   role-restricted;
-   auditable;
-   least-privilege;
-   separated from ordinary business permissions.

------------------------------------------------------------------------

# 54. Secure File Handling

## 54.1 Supported Media

BizLink may need to support:

-   business logos;
-   profile images;
-   certificates;
-   business documents;
-   attachments.

Large binary objects should not be unnecessarily stored directly in
operational relational tables.

**Recommended Design Decision:** Use object storage such as AWS S3 for
larger files when required, with metadata and ownership stored in MySQL.

## 54.2 File Ownership

Every uploaded file must have an identifiable owner/resource
relationship.

The application must verify that the uploader is authorized to attach
the file to that resource.

## 54.3 File Validation

Validate:

-   size;
-   MIME type;
-   extension;
-   filename;
-   ownership;
-   content restrictions;
-   upload authorization.

Do not trust the file extension alone.

## 54.4 File Access

Private files must not be exposed through unrestricted public URLs.

Use an appropriate controlled-access mechanism such as:

-   authorization-checked application endpoints;
-   short-lived signed URLs;
-   object-storage access policies.

## 54.5 File Deletion

Deletion must define:

-   database metadata removal/deactivation;
-   object-storage deletion;
-   orphan cleanup;
-   relationship to account/business deletion.

## 54.6 Malware and Unsafe Content

If arbitrary documents are accepted, the production architecture should
include an appropriate malware/content-scanning strategy before treating
the content as trusted.

This is a **Recommended Design Decision** unless explicitly required by
the source artifacts.

------------------------------------------------------------------------

# 57. Security Logging, Auditability, and Secrets

## 57.1 Security Events

The system should log security-relevant events such as:

-   authentication failures;
-   successful logins where operationally useful;
-   password reset initiation/completion;
-   token/session anomalies;
-   authorization failures;
-   account suspension;
-   administrator actions;
-   verification decisions;
-   moderation actions;
-   suspicious access patterns.

## 57.2 Auditability

Administrative actions must be traceable.

An audit/activity record should identify, where the approved schema
supports it:

-   actor;
-   action;
-   target;
-   timestamp;
-   relevant outcome;
-   non-sensitive context.

Do not store unnecessary secrets in audit records.

## 57.3 Logging Restrictions

Never log:

-   plaintext passwords;
-   password hashes where avoidable;
-   raw JWT/access tokens;
-   refresh tokens;
-   private keys;
-   database passwords;
-   API secrets.

Sensitive identifiers should be masked or omitted where appropriate.

## 57.4 Secret Management

Secrets must come from environment/configuration management.

Examples:

``` text
DATABASE_HOST
DATABASE_USER
DATABASE_PASSWORD
JWT_SECRET
JWT_REFRESH_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

The `.env.example` file may document required variable names with
placeholders.

Real credentials must never be committed to Git.

## 57.5 Least Privilege

Database/application accounts should receive only the permissions
required for their workload.

Do not use a high-privilege database administrator account as the normal
application runtime identity.

## 57.6 Security Acceptance Criteria

A security feature is complete when:

-   authentication behavior is documented;
-   authorization is enforced server-side;
-   validation is implemented;
-   parameterized queries are used;
-   rate limits exist for required endpoints;
-   sensitive errors are sanitized;
-   secrets are externalized;
-   logs do not expose credentials;
-   administrative actions are auditable;
-   file access is controlled;
-   security tests cover expected abuse cases.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [02 --- Frontend](./02-frontend.md)
-   [03 --- Backend and API](./03-backend-and-api.md)
-   [04 --- Database](./04-database.md)
-   [06 --- Features and Workflows](./06-features-and-workflows.md)
-   [07 --- Power BI and Analytics](./07-powerbi-and-analytics.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
-   [09 --- Roadmap, Traceability and
    Deployment](./09-roadmap-traceability-and-deployment.md)
