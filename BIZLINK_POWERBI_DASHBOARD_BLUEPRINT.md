# BizLink Executive Power BI Dashboard — Apple Analytics Edition

This design specification transforms the **BizLink B2B platform data** into an executive dashboard suite directly modeled on the Apple Analytics dashboard layout, typography, visual hierarchy, and color scheme.

---

## 🎨 Global Theme & Apple Design System

### 1. Color Palette
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#F5F5F7` | Neutral light gray background for the entire report canvas |
| **Container Cards** | `#FFFFFF` | Rounded card containers for every visual tile |
| **Card Borders** | `#E5E5EA` | 1px subtle stroke with border radius `16px` |
| **Primary Text / Heading** | `#1D1D1F` | High-contrast Apple charcoal for titles and big KPI values |
| **Secondary Subtitles** | `#86868B` | Subtle gray for category captions, dates, and column headers |
| **Accent Emerald (Positive)** | `#34C759` | Growth badges (▲ 85.7%), verified pills, success metrics |
| **Accent Apple Blue / Indigo** | `#0071E3` / `#5856D6`| Primary bar fills, active navigation tabs, interactive pills |
| **Apple Charcoal / Black** | `#000000` | Primary category bars, main donut slices, contrast accents |

### 2. Typography
- **Font Family**: `Segoe UI` (or `SF Pro Display` / `Inter` if installed locally)
- **Dashboard Titles**: `22pt - 26pt`, Bold, `#1D1D1F`
- **KPI Card Values**: `28pt - 32pt`, Semi-Bold / Bold, `#1D1D1F`
- **KPI Sub-labels / Pills**: `10pt`, Bold, `#34C759` (Growth) or `#86868B` (Context)
- **Chart Titles**: `12pt - 14pt`, Semi-Bold, `#1D1D1F`
- **Data Labels & Tooltips**: `9pt - 10pt`, Regular, `#1D1D1F`

---

## 📐 Page 1: Platform Executive Overview (Apple Sales Analytics)

This page maps to the **Apple Sales Analytics** reference image.

### Layout Wireframe & Coordinates (Canvas: 1920 × 1080 or 1280 × 720)

```
+---------------------------------------------------------------------------------------------------------+
| [LOGO] BizLink | [PAGE TITLE] BizLink Executive Analytics        [DATE] [CATEGORY] [STATE] [VERIFIED]   |
| "Connect. Collaborate. Scale."                                                                          |
+------+----------------------------------------------------------------------------------+---------------+
| HOME | [CARD 1: Active Businesses] [CARD 2: Pipeline Budget] [CARD 3: Collabs] [CARD 4: | [PROMO BANNER]|
|      |   14 (▲ 85.7% Verified)       ₹33.8L (Avg ₹1.54L)       5 (3 In-Flight)   4.46★  |               |
| SALE +-------------------------------------------------------+--------------------------+ "Powering     |
|      | [LINE CHART: Activity & Registration Trend]           | [HORIZONTAL BAR CHART:   |  India's      |
| PROD |   Jan to Dec (Cumulative Platform Growth)             |  Pipeline by Category]   |  B2B Network" |
|      |                                                       |  Maint, Supply, Mktg...  |               |
| NETW +---------------------------------+---------------------+--------------------------+               |
|      | [GEO BREAKDOWN: Business by     | [COLUMN CHART:      | [DONUT CHART:            | [ARROW BUTTON]|
| REVI |  State & City Table / Map]      |  Needs Count by Cat]|  Connection Status]      |               |
|      +---------------------------------+---------------------+--------------------------+---------------+
| INSG | [TOP RATED PARTNERS TABLE]                            | [KEY INSIGHTS BULLETS]                   |
|      |  Partner Name | Category | Rating ★ | Total Reviews    |  • 85.7% Verified Businesses             |
|      |  Bob Cool HVAC, SolarEdge, TechBridge...              |  • ₹33.8L Procurement Pipeline Value...  |
+------+-------------------------------------------------------+------------------------------------------+
```

### Visual Field Configurations for Page 1

#### 1. Left Navigation Bar (Canvas Left)
- **Visual Type**: Shape (Rounded Rectangle) or Slicer Button Bar
- **Position**: `X: 0, Y: 0, Width: 180, Height: 1080`
- **Background**: `#FFFFFF`, Border: `None`, Shadow: Soft
- **Top Elements**: BizLink Logo + Subtitle text *"Connect Different."*
- **Navigation Buttons**:
  - `Home` (Selected / Dark Pill: Background `#1D1D1F`, Text `#FFFFFF`)
  - `Services` (Default: Text `#86868B`)
  - `Collaborations` (Default: Text `#86868B`)
  - `Reviews` (Default: Text `#86868B`)
  - `Geography` (Default: Text `#86868B`)
- **Bottom Feature Card**:
  - Image / Gradient Banner: Charcoal black to slate (`#1D1D1F` to `#2C2C2E`)
  - Text: *"Innovation lives in every collaboration."*

#### 2. Top Header & Slicers
- **Title Visual**: Text box
  - Text: `BizLink Executive Analytics` (Size `24pt`, Bold)
  - Subtitle: `ENTERPRISES | COLLABORATIONS | NETWORK ECONOMY` (Size `9pt`, `#86868B`)
- **Top Slicers (Dropdown style with light gray border)**:
  1. **Date Slicer**: `Dim_Date[Date]` (Between or Dropdown)
  2. **Category**: `'bizlink categories'[name]`
  3. **State / City**: `'bizlink vw_current_businesses'[state]`
  4. **Status**: `'bizlink vw_current_businesses'[status]`

#### 3. Top Row KPI Scorecard Cards (4 Rounded Tiles)
Each card uses visual type **Card (New)** or **Multi-Row Card** with white background, 16px corner radius, and subtle drop shadow (`X: 0, Y: 4, Blur: 12, Color: rgba(0,0,0,0.04)`).

| Card | Primary Measure | Display Value | Callout Subtitle / Growth Pill | Accent Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Card 1** | `[Total Active Businesses]` | **14** | `▲ 85.7% Verified` (`[Verification Rate]`) | 🏢 Briefcase / Store |
| **Card 2** | `[Total Pipeline Budget Value]` | **₹33.80L** | `Avg ₹1.54L / need` (`[Average Need Budget]`) | 💰 Cash / Wallet |
| **Card 3** | `[Total Collaborations]` | **5** | `3 In-Flight · 2 Completed` | 🤝 Handshake / Team |
| **Card 4** | `[Average Review Rating]` | **4.46 ★** | `100% Positive (13 Reviews)` | ⭐ Star / Shield |

#### 4. Middle Left: Platform Growth & Activity Trend
- **Visual Type**: Line Chart / Area Chart
- **X-Axis**: `Dim_Date[Month]` (sorted by `MonthNo`)
- **Y-Axis**: `[Total Active Businesses]`
- **Secondary Y-Axis**: `[Total Commercial Needs]`
- **Styling**: Line Color `#1D1D1F`, Smooth interpolation, Data Labels On (`#1D1D1F`, bold).
- **Header Badge**: `Total Businesses | 14  ▲ 85.7%`

#### 5. Middle Right: Procurement Pipeline by Category
- **Visual Type**: Clustered Bar Chart (Horizontal)
- **Y-Axis**: `'bizlink vw_active_needs'[category_name]`
- **X-Axis**: `[Total Pipeline Budget Value]`
- **Data Labels**: On (Format: Display units in Lakhs/Thousands, e.g. `₹14.0L`, `₹11.1L`, `₹6.6L`, `₹2.1L`)
- **Bar Colors**: Top category Deep Charcoal `#1D1D1F`, subsequent bars Gradient Slate Gray (`#3A3A3C`, `#636366`, `#8E8E93`).

#### 6. Lower Left: Geographic Presence by State & City
- **Visual Type**: Table or Filled Map
- **Columns**:
  - `bizlink vw_current_businesses[state]`
  - `bizlink vw_current_businesses[city]`
  - `[Total Active Businesses]`
  - `[Verified Businesses]`
- **Sorting**: `[Total Active Businesses]` Descending (Maharashtra: 4, Karnataka: 2, Delhi: 2, etc.)

#### 7. Lower Center: Network Connection Health
- **Visual Type**: Donut Chart
- **Legend / Category**: `'bizlink connections'[status]` (`ACCEPTED`, `PENDING`, `REJECTED`, `BLOCKED`)
- **Values**: `COUNTROWS('bizlink connections')`
- **Center Callout Metric**: `[Total Connections]` (`12 Total`)
- **Slice Colors**:
  - `ACCEPTED` (58.3%): `#1D1D1F` (Charcoal)
  - `PENDING` (25.0%): `#0071E3` (Apple Blue)
  - `REJECTED` (8.3%): `#8E8E93` (Slate Gray)
  - `BLOCKED` (8.3%): `#E5E5EA` (Light Gray)

#### 8. Bottom Left: Top Rated B2B Network Partners
- **Visual Type**: Table with Conditional Formatting
- **Columns**:
  - `'bizlink vw_current_businesses'[name]`
  - `'bizlink vw_current_businesses'[primary_category_name]`
  - `[Average Review Rating]` (Formatted with Star `★`)
  - `[Total Reviews]`
- **Top Partners**:
  1. Bob Cool HVAC Solutions (5.0 ★ · 2 Reviews)
  2. SolarEdge Energy Systems (5.0 ★ · 1 Review)
  3. TechBridge IT Solutions (4.5 ★ · 2 Reviews)
  4. Pack It Up Supplies (4.5 ★ · 2 Reviews)
  5. Green Leaf Foods (4.5 ★ · 2 Reviews)

#### 9. Bottom Right: Key Executive Insights
- **Visual Type**: Card / Text Box with Apple rounded container styling
- **Content**:
  - 🟢 **85.7% Network Verification**: 12 of 14 active businesses have verified credentials.
  - 💼 **₹33.8L Procurement Pipeline**: Maintenance and Supply Chain lead commercial capital requirement.
  - ⭐ **High Ecosystem Trust**: Average network review score is **4.46 / 5.0** with 100% positive ratings.
  - 🤝 **60% Connection Conversion**: 7 mutual partner connections established across 4 industry sectors.
  - 🎯 **13 High-Compatibility Matches**: Algorithmic scoring detected 13 matches with ≥85% compatibility.

---

## 📐 Page 2: Services & Procurement Ecosystem (Product Dashboard)

This page maps to the **Product Dashboard** reference image.

### Visual Field Configurations for Page 2
- **Left Navigation**: `Services` tab selected (Dark pill).
- **Top 5 Category Cards (Horizontal Row)**:
  1. **Healthcare & Pharma**: 4 Businesses · 8 Listed Services
  2. **Supply Chain & Logistics**: 3 Businesses · ₹11.1L Pipeline Needs
  3. **Marketing & Media**: 3 Businesses · 9 Active Procurement Needs
  4. **Maintenance & Facilities**: 2 Businesses · ₹14.0L High-Value Pipeline
  5. **HVAC & Specialized**: 2 Businesses · 5.0 ★ Top Satisfaction
- **Quadrant Chart / Scatter Plot (Product Lifecycle)**:
  - **X-Axis**: `[Average Need Budget]`
  - **Y-Axis**: `[Average Review Rating]`
  - **Bubble Size**: `[Total Active Services]`
  - **Details**: `'bizlink categories'[name]`
- **Category Share by Active Needs (Donut Chart)**:
  - **Values**: `[Total Commercial Needs]`
  - **Legend**: `category_name`
  - **Center KPI**: `22 Needs Total`
- **Ratings by Category (Horizontal Bar Chart)**:
  - Horizontal bars showing average review rating across categories (HVAC: 5.0, Maintenance: 5.0, Marketing: 4.5, Supply Chain: 4.2).

---

## 📐 Page 3: Commercial Collaborations & Network Performance (Sales Dashboard)

This page maps to the **Sales Dashboard** reference image.

### Visual Field Configurations for Page 3
- **Left Navigation**: `Collaborations` tab selected (Dark pill).
- **KPI Row**:
  - **Active Collaborations**: `3` (In Progress)
  - **Completed Collaborations**: `2` (Fulfillment verified)
  - **Avg Collaboration Duration**: `60 Days`
  - **Mutual Connections**: `7` Accepted
- **Monthly Collaboration Pipeline & Delivery**:
  - Clustered Column + Line Chart: Columns = Initiated Collaborations, Line = Completed Collaborations.
- **Matrix: Category Inter-Trading & Collaborations**:
  - **Rows**: Initiator Business Category
  - **Columns**: Provider Service Category
  - **Values**: `[Total Collaborations]` count

---

## 🛠️ Step-by-Step Implementation Guide in Power BI Desktop

### Step 1: Canvas Setup
1. In Power BI Desktop, navigate to **Format Page** > **Canvas background**:
   - Color: `#F5F5F7`
   - Transparency: `0%`
2. Canvas size: `16:9` (1280 × 720 or 1920 × 1080).

### Step 2: Build the Left Navigation Strip
1. Insert > **Shapes** > **Rounded Rectangle**.
2. Set dimensions: `X: 0, Y: 0, Width: 180, Height: Full Height`.
3. Fill: `#FFFFFF`, Outline: `None`.
4. Insert text boxes or button icons for `Home`, `Services`, `Collaborations`, `Reviews`.
5. Set the active button background to `#1D1D1F` with white text and rounded corners (`10px`).

### Step 3: Insert KPI Cards (New Card Visual)
1. In the Visualizations pane, select **Card (new)**.
2. Drag measures from `_BizLink_Measures`:
   - `[Total Active Businesses]`
   - `[Total Pipeline Budget Value]`
   - `[Total Collaborations]`
   - `[Average Review Rating]`
3. In **Format visual** > **Callout values**:
   - Font: `Segoe UI Semibold`
   - Size: `28pt`
   - Color: `#1D1D1F`
4. In **Format visual** > **Cards**:
   - Background: `#FFFFFF`
   - Border: Solid, `1px`, Color `#E5E5EA`
   - Shape: Rounded rectangle, radius `16px`
   - Shadow: On, Outside bottom-right, Color `#00000010`.

### Step 4: Add the Charts and Visuals
1. **Activity Trend**: Insert **Line Chart**, add `Dim_Date[Month]` to X-axis and `[Total Active Businesses]` to Y-axis.
2. **Category Pipeline**: Insert **Clustered Bar Chart**, add `'bizlink vw_active_needs'[category_name]` to Y-axis and `[Total Pipeline Budget Value]` to X-axis.
3. **Connection Status**: Insert **Donut Chart**, add `'bizlink connections'[status]` to Legend and `COUNTROWS('bizlink connections')` to Values.
4. **Top Partners Table**: Insert **Table**, add Business Name, Category Name, `[Average Review Rating]`, and `[Total Reviews]`.
5. Apply the rounded container styling to each visual:
   - Visual > **General** > **Effects** > **Background**: `#FFFFFF`
   - Visual > **General** > **Effects** > **Visual border**: On, Color `#E5E5EA`, Corner radius `16px`.
