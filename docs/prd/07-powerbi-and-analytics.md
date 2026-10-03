# BizLink Product Requirements Document --- 07 Power BI and Analytics

> **Document Group:** Sections 33--38, 62--63, 63A\
> **Product:** BizLink\
> **PRD Version:** v9\
> **Status:** Final
> **Dependency:** Extends the database/reporting boundary defined in
> `04-database.md`.

------------------------------------------------------------------------

# 33. Analytics Architecture

## 33.1 Required Analytics Flow

BizLink analytics uses:

``` text
Operational MySQL
      ↓
Data Cleaning / Validation
      ↓
Curated CURRENT-STATE Reporting Views / Tables
      ↓
Power BI
```

The architecture does not introduce a separate ETL platform, Kafka
pipeline, Excel layer, or separate data warehouse for the current
implementation.

## 33.2 Current-State Principle

Power BI must represent the intended current operational state.

SCD Type 2 historical structures are retained for database-side
historical/audit requirements but are explicitly excluded from the Power
BI model.

## 33.3 Reporting Boundary

The reporting layer should expose stable, business-readable structures
so that Power BI does not need to reconstruct transactional business
logic unnecessarily.

Potential reporting structures may include:

-   current business dimension;
-   current user dimension;
-   current collaboration facts;
-   current review facts;
-   date dimension;
-   curated discovery/matching aggregates where required.

Exact reporting structures must remain consistent with `04-database.md`
and the authoritative ER schema.

------------------------------------------------------------------------

# 34. Data Preparation and Cleaning

## 34.1 Cleaning Objectives

Reporting data should be checked for:

-   duplicates;
-   invalid values;
-   inconsistent status;
-   invalid categories;
-   missing required reporting values;
-   malformed locations;
-   invalid dates;
-   inconsistent derived fields.

## 34.2 Data Integrity Rule

Cleaning must not silently modify authoritative transactional records.

Preferred model:

``` text
Transactional Data
      ↓
Validation / Transformation Logic
      ↓
Curated Reporting Structure
```

## 34.3 Current-State Selection

Where operational history exists, reporting structures must select the
intended current version.

SCD2 structures should not be directly imported into Power BI.

For an SCD2 dimension, current-state selection conceptually means:

``` text
natural_key
AND is_current = true
```

or an equivalent approved current-state view.

## 34.4 Derived Fields

Derived reporting fields may include:

-   active business indicator;
-   collaboration duration;
-   review eligibility state;
-   current connection status;
-   business profile completeness;
-   categorized activity.

Every derived metric must be documented.

------------------------------------------------------------------------

# 35. Analytics Model

## 35.1 Baseline Structures

The baseline model includes:

-   `dw_dim_date`
-   `dw_dim_business`
-   `dw_dim_user`
-   `dw_fact_collaboration`
-   `dw_fact_review`

These structures should support the required Power BI analysis without
importing SCD2/history tables.

## 35.2 Date Dimension

`dw_dim_date` should provide the time attributes required by reporting,
such as:

-   date;
-   day;
-   week;
-   month;
-   quarter;
-   year.

The exact implementation must follow the approved database/reporting
schema.

## 35.3 Business Dimension

`dw_dim_business` should represent the current reporting state of
businesses.

Potential reporting attributes:

-   business identity;
-   category;
-   location;
-   status;
-   verification state;
-   current profile attributes.

Historical SCD2 versions are excluded from Power BI.

## 35.4 User Dimension

`dw_dim_user` should represent the current reporting identity/state
needed for analytics.

Sensitive authentication information must never enter Power BI.

## 35.5 Collaboration Fact

`dw_fact_collaboration` should support:

-   collaboration count;
-   collaboration status;
-   completion;
-   relevant dates;
-   participating businesses;
-   duration where derivable.

## 35.6 Review Fact

`dw_fact_review` should support:

-   review count;
-   rating;
-   reviewed business;
-   reviewer;
-   date;
-   eligible relationship context where applicable.

------------------------------------------------------------------------

# 36. KPI Requirements

Every KPI must specify:

1.  KPI ID
2.  KPI name
3.  definition
4.  source table/view
5.  source fields
6.  calculation
7.  filters
8.  time dimension
9.  visual type
10. business meaning

A KPI must not be introduced unless it can be derived from the available
data.

## 36.1 Platform Overview

Examples of supported metrics:

-   total active businesses;
-   total active users where defined;
-   total services/offers;
-   total active needs;
-   total connections;
-   total collaborations;
-   total reviews.

Each metric requires a documented current-state definition.

## 36.2 Discovery

Potential KPIs:

-   businesses discoverable;
-   searches where telemetry exists;
-   discovery activity;
-   businesses by category;
-   businesses by location.

If search telemetry is not stored, do not invent a search-volume KPI.

## 36.3 Matching

Potential KPIs:

-   matches generated;
-   matches by category;
-   matches by location;
-   match-to-connection progression where the underlying relationship
    can be derived.

Rule-based matching must remain distinguishable from future AI matching.

## 36.4 Collaboration

Potential KPIs:

-   active collaborations;
-   completed collaborations;
-   collaborations by status;
-   collaboration completion rate;
-   average collaboration duration where dates exist.

## 36.5 Trust

Potential KPIs:

-   verified businesses;
-   unverified businesses;
-   review count;
-   average rating where statistically meaningful;
-   businesses with completed collaborations.

Do not create an unexplained "trust score."

## 36.6 Engagement

Potential KPIs:

-   active connections;
-   messages where message activity is intentionally reportable;
-   posts;
-   post interactions;
-   activity events.

Sensitive message content must never be exposed in analytics.

## 36.7 Growth

Potential KPIs:

-   new businesses over time;
-   new users over time;
-   new connections over time;
-   new collaborations over time;
-   new reviews over time.

Time-based metrics require a valid date relationship.

------------------------------------------------------------------------

# 37. Dashboard Requirements

## 37.1 Platform Overview Dashboard

Should provide:

-   active business count;
-   user/business growth;
-   services and needs;
-   connections;
-   collaborations;
-   reviews;
-   high-level geographic/category distribution where available.

## 37.2 Discovery Dashboard

Should provide:

-   business distribution;
-   categories;
-   locations;
-   service/offer distribution;
-   needs distribution;
-   discovery-related metrics where telemetry exists.

## 37.3 Matching Dashboard

Should provide:

-   match volume;
-   match categories;
-   relevant business domains;
-   match progression where derivable.

## 37.4 Collaboration Dashboard

Should provide:

-   status distribution;
-   active/completed collaborations;
-   collaboration duration;
-   trends over time;
-   participating business categories where supported.

## 37.5 Trust Dashboard

Should provide:

-   verification state;
-   reviews;
-   rating distribution;
-   completed collaboration evidence.

## 37.6 Engagement Dashboard

Should provide:

-   relationship activity;
-   messages/activity counts where appropriate;
-   posts/interactions;
-   active user/business measures.

## 37.7 Growth Dashboard

Should provide:

-   new businesses;
-   new users;
-   new connections;
-   new collaborations;
-   new reviews.

------------------------------------------------------------------------

# 38. Power BI Interaction and Security

## 38.1 Native Interactivity

Power BI visuals should support native:

-   cross-filtering;
-   cross-highlighting.

Selecting a visual should affect related visuals unless there is a
documented reason not to.

Do not disable native interactions merely for cosmetic reasons.

## 38.2 Power BI Desktop

The report should be developed and validated in Power BI Desktop.

Validation includes:

-   source connectivity;
-   relationships;
-   measures;
-   slicers;
-   visual interactions;
-   current-state data;
-   exclusion of SCD2/history.

## 38.3 Power BI Service

The final report should be published to Power BI Service.

The deliverable is not complete if the report exists only in a local
`.pbix` file.

## 38.4 Access Control

The published report must use an authorized access mechanism such as:

-   authenticated Power BI sharing;
-   authorized embed;
-   another approved secure sharing model.

Anonymous/public publishing must not be used unless explicitly required
and approved.

## 38.5 Sensitive Data

Do not expose:

-   passwords;
-   authentication tokens;
-   secret credentials;
-   unnecessary private messages;
-   sensitive administrative data.

------------------------------------------------------------------------

# 62. Analytics Requirements

**FR-ANL-001 --- Current-State Analytics**

The system shall provide curated current-state data structures suitable
for Power BI.

**NFR-DATA-001 --- Reporting Integrity**

Every dashboard metric must trace to a documented source and
calculation.

**NFR-OBS-001 --- Analytics Observability**

Reporting refresh/data failures must be detectable and diagnosable
without exposing sensitive data.

## 62.1 Analytics Traceability

For every dashboard metric:

``` text
KPI
 ↓
Calculation
 ↓
Reporting View / Fact
 ↓
Operational Source
 ↓
Database Entity
```

This traceability must be maintained when database schema changes are
approved.

------------------------------------------------------------------------

# 63. Power BI Deliverables

Required deliverables include:

1.  curated reporting SQL;
2.  Power BI data model;
3.  documented measures;
4.  required dashboard pages;
5.  native visual interactions;
6.  secure publication;
7.  validation evidence;
8.  data-source documentation.

Recommended repository organization:

``` text
database/views/
    reporting_*.sql

docs/
    powerbi/
        data-model.md
        measures.md
        dashboard-validation.md
```

The exact documentation paths may be refined in the deployment/roadmap
specification.

------------------------------------------------------------------------

# 63A. Power BI Definition of Done

Power BI is complete only when:

-   report is built;
-   report is published to Power BI Service;
-   report is accessible through an authorized mechanism;
-   current-state data is used;
-   SCD2/history structures are excluded;
-   required KPI calculations are documented;
-   visual interactions work;
-   data relationships are validated;
-   filters/slicers behave correctly;
-   no unsupported KPI is present;
-   reporting refresh/data access is validated;
-   sensitive data is excluded.

Power BI must only begin after the Layer 3 frontend gate and explicit
human approval, as defined by the project orchestration requirements.

------------------------------------------------------------------------

## Cross-File Navigation

-   [00 --- Overview](./00-overview.md)
-   [01 --- Personas and Product](./01-personas-and-product.md)
-   [02 --- Frontend](./02-frontend.md)
-   [03 --- Backend and API](./03-backend-and-api.md)
-   [04 --- Database](./04-database.md)
-   [05 --- Security](./05-security.md)
-   [06 --- Features and Workflows](./06-features-and-workflows.md)
-   [08 --- Testing, Quality and
    Operations](./08-testing-quality-and-operations.md)
-   [09 --- Roadmap, Traceability and
    Deployment](./09-roadmap-traceability-and-deployment.md)
