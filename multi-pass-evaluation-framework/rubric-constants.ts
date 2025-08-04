// rubric-constants.ts

export interface SubcategoryMetadata {
    key: string;
    description: string;
    maxPoints: number;
}

export const layoutAndStructureSubcategories: SubcategoryMetadata[] = [
    {
        key: "Element Alignment",
        description: "Are components correctly aligned to each other (vertically and horizontally)?",
        maxPoints: 15,
    },
    {
        key: "Relative Positioning",
        description: "Are elements placed in the right order and grouping (e.g. icons before text)?",
        maxPoints: 10,
    },
    {
        key: "Element Size Consistency",
        description: "Are component dimensions (height, width) consistent with the design?",
        maxPoints: 10,
    },
    {
        key: "Group Nesting & Hierarchy",
        description: "Are visual groups (e.g. card with title + subtitle) properly nested and structured?",
        maxPoints: 15,
    },
    {
        key: "Z-Index / Layering",
        description: "Are overlapping elements correctly stacked (e.g. modal above background)?",
        maxPoints: 10,
    },
    {
        key: "Column/Grid Structure",
        description: "Are grid layouts preserved (e.g. 2-column layout, uniform list spacing)?",
        maxPoints: 15,
    },
    {
        key: "Padding Within Components",
        description: "Is inner padding (e.g. text inside a button) correct?",
        maxPoints: 10,
    },
    {
        key: "Inter-Component Spacing",
        description: "Are margins between distinct components (e.g. button and input) accurate?",
        maxPoints: 15,
    },
];

export const visualDesignSubcategories: SubcategoryMetadata[] = [
    {
        key: "Color Matching",
        description: "Are background, text, and accent colors accurate (including opacity)?",
        maxPoints: 20,
    },
    {
        key: "Button States",
        description: "Are hover, disabled, selected, or pressed states visually distinct as in the design?",
        maxPoints: 10,
    },
    {
        key: "Typography Family",
        description: "Are exact same fonts used? If not, what is the difference?",
        maxPoints: 10,
    },
    {
        key: "Font Size & Weight",
        description: "Are font sizes and weights matched correctly? If not, what is the difference?",
        maxPoints: 10,
    },
    {
        key: "Text Alignment & Spacing",
        description: "Is text left/center/right aligned as in Figma? Is line height consistent?",
        maxPoints: 10,
    },
    {
        key: "Border Styling",
        description: "Are borders (width, color, radius) applied accurately?",
        maxPoints: 10,
    },
    {
        key: "Iconography & Assets",
        description: "Are icons/images correct in style and size (e.g. outlined vs filled icons)?",
        maxPoints: 10,
    },
    {
        key: "Shadow & Elevation",
        description: "Are elevation and shadow effects present and correct (if used)?",
        maxPoints: 10,
    },
    {
        key: "Gradient/Fills",
        description: "Are gradient fills or background patterns preserved?",
        maxPoints: 10,
    },
];

export const contentAndInformationArchitectureSubcategories: SubcategoryMetadata[] = [
    {
        key: "Text Placement",
        description: "Is each text label/title/subtitle located exactly where it should be?",
        maxPoints: 20,
    },
    {
        key: "Text Content Presence",
        description: "Are all key text elements present (not missing or hallucinated)?",
        maxPoints: 10,
    },
    {
        key: "Label Hierarchy",
        description: "Is the heading/subheading/body label hierarchy preserved visually?",
        maxPoints: 10,
    },
    {
        key: "Repeated Content Structures",
        description: "Are lists, tables, or repeated items visually correct and uniform?",
        maxPoints: 15,
    },
    {
        key: "Section Titles/Dividers",
        description: "Are section labels and visual separators (lines, cards) in the correct place?",
        maxPoints: 10,
    },
    {
        key: "Placeholder/Text Fallbacks",
        description: "Are placeholders (e.g. \"Search…\") styled and positioned correctly?",
        maxPoints: 10,
    },
    {
        key: "Overflow Handling",
        description: "Do scrollable or clipped areas look natural and follow the design constraints?",
        maxPoints: 10,
    },
    {
        key: "Visual Feedback Regions",
        description: "Is feedback (e.g. empty state, error state) visually aligned with expectations?",
        maxPoints: 15,
    },
];
