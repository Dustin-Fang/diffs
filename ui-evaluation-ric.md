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

## Evaluation Categories (Total: 300 points)

### 1. Layout & Structure (100 points)
- **Component Positioning (30 points)**: Exact X/Y positioning and alignment of major components.
- **Element Sizing (30 points)**: Correct width and height of all elements (buttons, cards, text fields).
- **Spacing & Margins (20 points)**: Correct padding and margins between elements.
- **Component Hierarchy & Nesting (20 points)**: Correct parent-child relationships and layering (z-index).

### 2. Visual Design (100 points)
- **Color Accuracy (30 points)**: Exact hex code matching for backgrounds, text, and icons.
- **Typography - Font Family & Weight (20 points)**: Correct font family and weight (e.g., Regular, Bold).
- **Typography - Font Size & Line Height (20 points)**: Correct font size and line height.
- **Iconography (15 points)**: Correct icons used, matching style and size.
- **Visual Effects (15 points)**: Accurate implementation of shadows, borders, corner radii, and gradients.

### 3. Content & Information Architecture (100 points)
- **Text Content Accuracy (40 points)**: Exact match of static text content.
- **Text Hierarchy & Structure (30 points)**: Correct use of headings, paragraphs, and labels.
- **Placeholder & Dynamic Content (20 points)**: Correct implementation of placeholders and handling of dynamic data fields.
- **Readability & Text Wrapping (10 points)**: Correct text wrapping and overall readability.

## Output Format
**IMPORTANT**: You MUST follow this output format precisely. Use simple markdown lists (`-` or `*`) and do NOT nest list items (e.g., `* -`). Each point must be on a new line.

Score: [0-300]
Breakdown:
- Layout & Structure: [0-100]
- Visual Design: [0-100]
- Content & Information Architecture: [0-100]

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
