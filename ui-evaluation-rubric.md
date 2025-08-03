# UI Recreation Evaluation Rubric

## Overview
This rubric evaluates UI recreation quality, comparing LLM-generated Android UI against the original Figma design. Score: 0-300 (300 = perfect).

## Data Variation Considerations
**IMPORTANT**: Do NOT penalize differences due to mock data:
- Pricing Information: Different prices, costs, monetary values
- Dates and Times: Specific dates, times, temporal information  
- User Data: Names, addresses, phone numbers, personal information
- Product Information: Product names, descriptions, specifications
- Quantities and Numbers: Stock levels, ratings, counts, numerical data
- Status Information: Availability status, booking states, dynamic content
- Location Data: Addresses, coordinates, location-specific information

## 🧮 Evaluation Categories (Total: 300 Points)

### 1. 📐 Layout & Structure (100 points)

| Subcategory                    | Points | Description                                                                 |
|-------------------------------|--------|-----------------------------------------------------------------------------|
| **Element Alignment**          | 15     | Are components correctly aligned to each other (vertically and horizontally)? |
| **Relative Positioning**       | 10     | Are elements placed in the right order and grouping (e.g. icons before text)? |
| **Element Size Consistency**   | 10     | Are component dimensions (height, width) consistent with the design?        |
| **Group Nesting & Hierarchy**  | 15     | Are visual groups (e.g. card with title + subtitle) properly nested and structured? |
| **Z-Index / Layering**         | 10     | Are overlapping elements correctly stacked (e.g. modal above background)?    |
| **Column/Grid Structure**      | 15     | Are grid layouts preserved (e.g. 2-column layout, uniform list spacing)?     |
| **Padding Within Components**  | 10     | Is inner padding (e.g. text inside a button) correct?                        |
| **Inter-Component Spacing**    | 15     | Are margins between distinct components (e.g. button and input) accurate?    |

---

### 2. 🎨 Visual Design (100 points)

| Subcategory               | Points | Description                                                                 |
|---------------------------|--------|-----------------------------------------------------------------------------|
| **Color Matching**         | 20     | Are background, text, and accent colors accurate (including opacity)?       |
| **Button States**          | 10     | Are hover, disabled, selected, or pressed states visually distinct as in the design? |
| **Typography Family**      | 10     | Are correct fonts used (e.g. Roboto vs sans-serif fallback)?                |
| **Font Size & Weight**     | 10     | Are font sizes and boldness matched correctly?                              |
| **Text Alignment & Spacing** | 10   | Is text left/center/right aligned as in Figma? Is line height consistent?   |
| **Border Styling**         | 10     | Are borders (width, color, radius) applied accurately?                      |
| **Iconography & Assets**   | 10     | Are icons/images correct in style and size (e.g. outlined vs filled icons)? |
| **Shadow & Elevation**     | 10     | Are elevation and shadow effects present and correct (if used)?             |
| **Gradient/Fills**         | 10     | Are gradient fills or background patterns preserved?                        |

---

### 3. 🧾 Content & Information Architecture (100 points)

| Subcategory                   | Points | Description                                                                   |
|-------------------------------|--------|-------------------------------------------------------------------------------|
| **Text Placement**             | 20     | Is each text label/title/subtitle located exactly where it should be?        |
| **Text Content Presence**      | 10     | Are all key text elements present (not missing or hallucinated)?             |
| **Label Hierarchy**           | 10     | Is the heading/subheading/body label hierarchy preserved visually?           |
| **Repeated Content Structures** | 15   | Are lists, tables, or repeated items visually correct and uniform?           |
| **Section Titles/Dividers**   | 10     | Are section labels and visual separators (lines, cards) in the correct place? |
| **Placeholder/Text Fallbacks**| 10     | Are placeholders (e.g. "Search…") styled and positioned correctly?           |
| **Overflow Handling**         | 10     | Do scrollable or clipped areas look natural and follow the design constraints? |
| **Visual Feedback Regions**   | 15     | Is feedback (e.g. empty state, error state) visually aligned with expectations? |

## Output Format

**IMPORTANT**: You MUST follow this output format precisely. Use simple markdown lists (`-` or `*`) and do NOT nest list items (e.g., `* -`). Each point must be on a new line. Make sure to try as hard as you can to score each of the line items in each subcategory.

Score: [0-300]
Breakdown:
- Layout & Structure: [0-100]
- Visual Design: [0-100]
- Content & Information Architecture: [0-100]

Subcategory Scores:
- **Layout & Structure**
| Subcategory | Score |
| --- | --- |
| Element Alignment | [0-15] |
| Relative Positioning | [0-10] |
| Element Size Consistency | [0-10] |
| Group Nesting & Hierarchy | [0-15] |
| Z-Index / Layering | [0-10] |
| Column/Grid Structure | [0-15] |
| Padding Within Components | [0-10] |
| Inter-Component Spacing | [0-15] |

- **Visual Design**
| Subcategory | Score |
| --- | --- |
| Color Matching | [0-20] |
| Button States | [0-10] |
| Typography Family | [0-10] |
| Font Size & Weight | [0-10] |
| Text Alignment & Spacing | [0-10] |
| Border Styling | [0-10] |
| Iconography & Assets | [0-10] |
| Shadow & Elevation | [0-10] |
| Gradient/Fills | [0-10] |

- **Content & Information Architecture**
| Subcategory | Score |
| --- | --- |
| Text Placement | [0-20] |
| Text Content Presence | [0-10] |
| Label Hierarchy | [0-10] |
| Repeated Content Structures | [0-15] |
| Section Titles/Dividers | [0-10] |
| Placeholder/Text Fallbacks | [0-10] |
| Overflow Handling | [0-10] |
| Visual Feedback Regions | [0-15] |

Key Strengths:
- [Strength 1]
- [Strength 2]

Areas for Improvement:
- [Improvement 1]
- [Improvement 2]

Micro-Differences Detected:
- `[Critical]` [Description of difference]
- `[Moderate]` [Description of difference]
- `[Minor]` [Description of difference]

Data Variations Noted:
- [Data variation 1]
- [Data variation 2]

Overall Assessment:
[Brief summary of recreation quality with emphasis on precision]

### Formatting Example:

**GOOD Example (Correct Formatting):**
```
Micro-Differences Detected:
- `[Critical]` The primary button color is incorrect.
- `[Minor]` The header text is 2px too low.
```

**BAD Example (Incorrect Formatting):**
```
Micro-Differences Detected:
* - **[Critical]** The primary button color is incorrect.
  - The header text is 2px too low.
```
