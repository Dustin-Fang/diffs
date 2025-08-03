# UI Recreation Evaluation Rubric

## Overview

This rubric is designed for LLM evaluation of UI recreation quality, comparing LLM-generated Android UI against the original Figma design. The evaluation should output a score from 0-300, where 300 represents perfect recreation. **This rubric is designed to be highly sensitive to minute differences and will penalize even small variations.**

## Data Variation Considerations

**IMPORTANT**: The evaluator must distinguish between design implementation errors and legitimate differences due to data variations. The following elements should NOT be penalized when they differ due to mock data:

- **Pricing Information**: Different prices, costs, or monetary values
- **Dates and Times**: Specific dates, times, or temporal information
- **User Data**: Names, addresses, phone numbers, or personal information
- **Product Information**: Product names, descriptions, or specifications that may vary
- **Quantities and Numbers**: Stock levels, ratings, counts, or numerical data
- **Status Information**: Availability status, booking states, or dynamic content
- **Location Data**: Addresses, coordinates, or location-specific information

**Evaluation Principle**: Focus on the **structure, layout, and design patterns** rather than the specific content values. A price of "$150" vs "$200" should not affect the score if the price display component is correctly implemented.

## Evaluation Categories (Total: 300 points)

### 1. Layout & Structure (100 points)

- **Component Positioning (40 points)**
  - **Exact positioning (±2px tolerance)**: 20 points
  - **Relative spacing accuracy**: 10 points
  - **Alignment precision (left, center, right)**: 10 points
  
- **Component Sizing (30 points)**
  - **Exact width and height (±2px tolerance)**: 15 points
  - **Aspect ratio accuracy**: 10 points
  - **Component proportions and scaling**: 5 points

- **Component Hierarchy (10 points)**
  - **Parent-child relationships**: 15 points
  - **Z-index/layering order**: 10 points
  - **Grouping and nesting structure**: 5 points

- **Spacing & Margins (20 points)**
  - **Exact margin values (±1px)**: 15 points
  - **Padding consistency**: 10 points
  - **Component spacing ratios**: 5 points

### 2. Visual Design (100 points)

- **Color Accuracy (40 points)**
  - **Primary colors (exact hex values)**: 20 points
  - **Secondary/tertiary colors**: 10 points
  - **Color opacity/transparency**: 10 points

- **Typography (35 points)**
  - **Font family exact match**: 15 points
  - **Font size precision (±1px)**: 10 points
  - **Font weight accuracy**: 5 points
  - **Text alignment precision**: 5 points

- **Visual Effects (25 points)**
  - **Shadow properties (offset, blur, color)**: 10 points
  - **Border properties (width, style, color)**: 8 points
  - **Gradient/background accuracy**: 7 points

### 3. Content & Information Architecture (100 points)

- **Text Content Structure (60 points)**
  - **Text positioning (±2px)**: 20 points
  - **Text hierarchy and emphasis**: 15 points
  - **Content placeholders and structure**: 15 points
  - **Text wrapping and overflow handling**: 10 points
  - Note: Specific text values may differ due to data

- **Data Display Patterns (40 points)**
  - **List/grid structure accuracy**: 15 points
  - **Dynamic content placeholder positioning**: 10 points
  - **Information density and readability**: 10 points
  - **Data field alignment and spacing**: 5 points
  - Note: Actual data values may differ due to mock data

## Highly Sensitive Scoring Algorithm

### Base Score Calculation

1. **Category Scoring**: Each category is scored independently (0-100 points each)
2. **Weighted Sum**: Total = Layout(100) + Visual(100) + Content(100)
3. **Base Score**: Raw total from 0-300

### Strict Penalty System for Minute Differences

- **Critical Errors (-20 points each)**
  - Missing major UI components
  - Completely incorrect layout structure
  - Wrong component types

- **Major Issues (-10 points each)**
  - Significant color mismatches (>10% difference)
  - Major typography errors (wrong font family)
  - Broken component relationships
  - Incorrect data display patterns (structure, not values)
  - Positioning errors >5px

- **Moderate Issues (-5 points each)**
  - Color variations (5-10% difference)
  - Font size differences (±2-5px)
  - Spacing inconsistencies (±2-5px)
  - Minor alignment issues

- **Minor Issues (-2 points each)**
  - Slight spacing inconsistencies (±1-2px)
  - Minor color variations (<5% difference)
  - Small alignment issues (±1px)
  - Font weight variations

- **Micro Issues (-1 point each)**
  - Pixel-perfect positioning differences
  - Minor opacity variations
  - Slight shadow differences
  - Border width variations (±1px)

### Data Variation Exemptions

**NO PENALTIES** for the following differences:

- Different prices, costs, or monetary amounts
- Different dates, times, or temporal information
- Different names, addresses, or personal data
- Different product names or descriptions
- Different quantities, ratings, or numerical values
- Different status indicators or availability states

### Sensitivity Multipliers

For highly similar designs, apply these multipliers to increase sensitivity:

- **Positioning errors**: 1.5x penalty multiplier
- **Color variations**: 1.3x penalty multiplier
- **Typography differences**: 1.4x penalty multiplier
- **Spacing inconsistencies**: 1.6x penalty multiplier

## Evaluation Instructions for LLM

1. **Pixel-Perfect Analysis**: Examine every element with extreme precision
2. **Comparative Assessment**: Compare every element between source and recreation
3. **Data-Aware Evaluation**: Distinguish between design implementation and data variations
4. **Contextual Understanding**: Consider the purpose and user experience of each component
5. **Platform Awareness**: Evaluate Android-specific implementation quality
6. **Holistic Scoring**: Consider the overall user experience, not just visual similarity
7. **Micro-Detail Focus**: Pay attention to even 1-2 pixel differences

### Key Evaluation Questions

- Is the component structure and layout correct?
- Are the visual design elements properly implemented?
- Does the information architecture match the original?
- Are data placeholders and patterns correctly structured?
- Would the UI work with different data values?
- **Are there any pixel-perfect positioning differences?**
- **Are color values exactly matching?**
- **Are font sizes and weights precisely correct?**
- **Are spacing and margins exactly the same?**

## Expected Score Ranges

- **280-300**: Near-perfect recreation with minimal differences
- **250-279**: Very good recreation with minor variations
- **200-249**: Good recreation with noticeable differences
- **150-199**: Acceptable recreation with significant variations
- **100-149**: Poor recreation with major differences
- **0-99**: Failed recreation with critical errors

## Output Format

```
Score: [0-300]
Breakdown:
- Layout & Structure: [0-100]
- Visual Design: [0-100]
- Content & Information Architecture: [0-100]

Key Strengths:
[List 2-3 major strengths]

Areas for Improvement:
[List 2-3 critical areas needing work]

Micro-Differences Detected:
[List specific pixel-level differences found]

Data Variations Noted:
[List any data differences that were correctly ignored]

Overall Assessment:
[Brief summary of recreation quality with emphasis on precision]
```
