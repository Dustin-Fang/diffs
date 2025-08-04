// atomic-rubric-v2.ts

export interface SubcategoryMetadata {
    key: string;
    description: string;
    maxPoints: number;
}

export const textAndTypographySubcategories: SubcategoryMetadata[] = [
    {
        key: "Text Content Presence",
        description: "Are all key text elements present and not missing or hallucinated?",
        maxPoints: 10,
    },
    {
        key: "Text Content Accuracy",
        description: "Does the content of each text label/title/subtitle exactly match the source?",
        maxPoints: 10,
    },
    {
        key: "Typography Family",
        description: "Is the exact font family used? (e.g., Roboto vs. Arial).",
        maxPoints: 10,
    },
    {
        key: "Font Size",
        description: "Are font sizes matched correctly for all text elements?",
        maxPoints: 10,
    },
    {
        key: "Font Weight",
        description: "Are font weights (e.g., bold, semi-bold, regular) matched correctly?",
        maxPoints: 10,
    },
    {
        key: "Line Height & Letter Spacing",
        description: "Are line height and letter spacing consistent with the design?",
        maxPoints: 10,
    },
    {
        key: "Text Alignment",
        description: "Is text alignment (left, center, right) for all text blocks correct?",
        maxPoints: 10,
    },
];

export const colorAndFillSubcategories: SubcategoryMetadata[] = [
    {
        key: "Background Color",
        description: "Is the background color of the overall UI and individual components accurate?",
        maxPoints: 10,
    },
    {
        key: "Text Color",
        description: "Are text colors (including opacity) accurate for all elements?",
        maxPoints: 10,
    },
    {
        key: "Accent & Icon Color",
        description: "Are accent colors and icon colors (including opacity) accurate?",
        maxPoints: 10,
    },
    {
        key: "Gradient/Fills",
        description: "Are gradient fills or background patterns preserved and accurate?",
        maxPoints: 10,
    },
];

export const sizingAndDimensionSubcategories: SubcategoryMetadata[] = [
    {
        key: "Element Width Consistency",
        description: "Are the widths of individual components consistent with the design?",
        maxPoints: 10,
    },
    {
        key: "Element Height Consistency",
        description: "Are the heights of individual components consistent with the design?",
        maxPoints: 10,
    },
    {
        key: "Icon/Asset Size",
        description: "Are the sizes of icons and images accurate?",
        maxPoints: 10,
    },
    {
        key: "Border Width",
        description: "Are border widths applied accurately?",
        maxPoints: 10,
    },
];

export const spacingAndPositioningSubcategories: SubcategoryMetadata[] = [
    {
        key: "Element X-Axis Alignment",
        description: "Are components correctly aligned on the horizontal axis (e.g., left-aligned, right-aligned, centered)?",
        maxPoints: 10,
    },
    {
        key: "Element Y-Axis Alignment",
        description: "Are components correctly aligned on the vertical axis (e.g., top-aligned, bottom-aligned, centered)?",
        maxPoints: 10,
    },
    {
        key: "Relative Ordering",
        description: "Are elements placed in the correct visual order (e.g., icon before text, title above subtitle)?",
        maxPoints: 10,
    },
    {
        key: "Inner Padding",
        description: "Is the inner padding (e.g., text inside a button, content within a card) correct?",
        maxPoints: 10,
    },
    {
        key: "Inter-Component Horizontal Spacing",
        description: "Is the margin/spacing between distinct components on the horizontal axis accurate?",
        maxPoints: 10,
    },
    {
        key: "Inter-Component Vertical Spacing",
        description: "Is the margin/spacing between distinct components on the vertical axis accurate?",
        maxPoints: 10,
    },
];

export const structureAndHierarchySubcategories: SubcategoryMetadata[] = [
    {
        key: "Group Nesting",
        description: "Are visual groups (e.g., card with title + subtitle) correctly nested and structured?",
        maxPoints: 10,
    },
    {
        key: "Z-Index / Layering",
        description: "Are overlapping elements correctly stacked (e.g., modal above background)?",
        maxPoints: 10,
    },
    {
        key: "Column/Grid Structure",
        description: "Is the overall grid layout (e.g., 2-column layout, uniform list spacing) preserved?",
        maxPoints: 15,
    },
    {
        key: "Label Hierarchy",
        description: "Is the visual hierarchy of headings, subheadings, and body text preserved?",
        maxPoints: 10,
    },
    {
        key: "Repeated Content Uniformity",
        description: "Are items within lists, tables, or repeated sections visually uniform in structure and spacing?",
        maxPoints: 15,
    },
    {
        key: "Section Dividers/Separators",
        description: "Are visual separators (lines, cards) and section labels present in the correct places?",
        maxPoints: 10,
    },
    {
        key: "Placeholder & Fallback Content",
        description: "Is placeholder text (e.g., \"Search...\") or empty state content correctly present and styled?",
        maxPoints: 10,
    },
    {
        key: "Overflow & Clipping",
        description: "Do scrollable or clipped areas correctly handle content that exceeds the bounds?",
        maxPoints: 10,
    },
];

export const stylingAndEffectsSubcategories: SubcategoryMetadata[] = [
    {
        key: "Border Color",
        description: "Are border colors applied accurately?",
        maxPoints: 10,
    },
    {
        key: "Border Radius",
        description: "Is the border radius (e.g., rounded corners) applied accurately?",
        maxPoints: 10,
    },
    {
        key: "Iconography Match",
        description: "Are icons and images correct in style (e.g., outlined vs filled) and type?",
        maxPoints: 10,
    },
    {
        key: "Shadow & Elevation",
        description: "Are shadow and elevation effects present and correct (color, blur, offset)?",
        maxPoints: 10,
    },
];