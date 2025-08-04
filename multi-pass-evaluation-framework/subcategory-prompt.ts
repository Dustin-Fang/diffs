import * as rubric from './atomic-rubric-constants';

export function buildSubcategoryPrompt(subcategory: rubric.SubcategoryMetadata): string {
    return `
You are an expert UI/UX evaluator. Your task is to evaluate a specific aspect of a UI recreation against a source design.

SOURCE IMAGE: [Attached]
RECREATION IMAGE: [Attached]

EVALUATION CRITERIA:
- Subcategory: "${subcategory.key}"
- Question to answer: "${subcategory.description}"
- Maximum Score: ${subcategory.maxPoints}

INSTRUCTIONS:
1.  Carefully compare the RECREATION IMAGE to the SOURCE IMAGE based *only* on the subcategory described above.
2.  Assign a score from 0 to ${subcategory.maxPoints}, where ${subcategory.maxPoints} means a perfect match for this specific criteria.
3.  Provide a brief reasoning for your score. If there are discrepancies, describe them.
4.  Remember to use tools to help you evaluate the images. Zoom into images to more carefully evaluate the differences. Draw bounding boxes around elements to help you evaluate the differences and check alignment.
5.  Limit the reasoning to 50 words. Only cite the differences between the source and recreation.
6.  Respond with ONLY a valid JSON object in the following format. Do not include any other text, markdown, or explanations outside of the JSON structure.
{
  "score": <number>,
  "reasoning": "<string>"
}

## Data Variation Considerations
**IMPORTANT**: Do NOT penalize differences due to mock data:
- Pricing Information: Different prices, costs, monetary values
- Dates and Times: Specific dates, times, temporal information  
- User Data: Names, addresses, phone numbers, personal information
- Product Information: Product names, descriptions, specifications
- Quantities and Numbers: Stock levels, ratings, counts, numerical data
- Status Information: Availability status, booking states, dynamic content
- Location Data: Addresses, coordinates, location-specific information
`;
}