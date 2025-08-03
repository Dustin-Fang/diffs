import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

interface UIEvaluationResult {
    score: number;
    breakdown: {
        layout: number;
        visual: number;
        content: number;
    };
    strengths: string[];
    improvements: string[];
    microDifferences: string[];
    dataVariations: string[];
    assessment: string;
    apiError?: {
        provider: string;
        status: number;
        message: string;
        details?: any;
    };
}

interface ImageData {
    data: Buffer | ArrayBuffer | string;
    mimeType?: string;
    filename?: string;
}

class UIEvaluator {
    private geminiApiKey: string;
    private claudeApiKey: string;
    private openaiApiKey: string;

    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY || '';
        this.claudeApiKey = process.env.CLAUDE_API_KEY || '';
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    }

    async evaluateUI(
        sourceImage: ImageData,
        recreationImage: ImageData,
        llmProvider: 'gemini' | 'claude' | 'openai' = 'claude'
    ): Promise<UIEvaluationResult> {
        const rubric = await this.loadRubric();
        const prompt = this.buildEvaluationPrompt(sourceImage, recreationImage, rubric);

        try {
            let evaluation: string;
            
            switch (llmProvider) {
                case 'gemini':
                    evaluation = await this.evaluateWithGemini(prompt, sourceImage, recreationImage);
                    break;
                case 'claude':
                    evaluation = await this.evaluateWithClaude(prompt, sourceImage, recreationImage);
                    break;
                case 'openai':
                    evaluation = await this.evaluateWithOpenAI(prompt, sourceImage, recreationImage);
                    break;
                default:
                    throw new Error(`Unsupported LLM provider: ${llmProvider}`);
            }

            return this.parseEvaluationResult(evaluation);
        } catch (error) {
            console.error('Evaluation failed:', error);
            
            // Extract API error information if available
            let apiError = undefined;
            if (error instanceof Error) {
                const errorMessage = error.message;
                if (errorMessage.includes('API error:')) {
                    const match = errorMessage.match(/(\w+) API error: (\d+) - (.+)/);
                    if (match) {
                        apiError = {
                            provider: match[1].toLowerCase(),
                            status: parseInt(match[2]),
                            message: match[3],
                            details: errorMessage
                        };
                    }
                }
            }
            
            // Return error state instead of mock result
            return {
                score: 0,
                breakdown: { layout: 0, visual: 0, content: 0 },
                strengths: [],
                improvements: ['Evaluation failed - see API error details'],
                microDifferences: [],
                dataVariations: [],
                assessment: 'Evaluation failed due to API error',
                apiError
            };
        }
    }

    private async loadRubric(): Promise<string> {
        try {
            const rubricPath = path.join(process.cwd(), 'ui-evaluation-rubric.md');
            const rubricContent = await fs.readFile(rubricPath, 'utf-8');
            return rubricContent;
        } catch (error) {
            console.warn('Using fallback rubric');
            return this.getFallbackRubric();
        }
    }

    private getFallbackRubric(): string {
        return `
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
- **Component Positioning (40 points)**: Exact positioning, relative spacing, alignment
- **Component Hierarchy (30 points)**: Parent-child relationships, layering, grouping
- **Spacing & Margins (30 points)**: Exact margins, padding consistency, spacing ratios

### 2. Visual Design (100 points)
- **Color Accuracy (40 points)**: Primary/secondary colors, opacity/transparency
- **Typography (35 points)**: Font family, size, weight, alignment
- **Visual Effects (25 points)**: Shadows, borders, gradients

### 3. Content & Information Architecture (100 points)
- **Text Content Structure (60 points)**: Text positioning, hierarchy, placeholders
- **Data Display Patterns (40 points)**: List/grid structure, dynamic content, readability

## Output Format
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
`;
    }

    private buildEvaluationPrompt(
        sourceImage: ImageData,
        recreationImage: ImageData,
        rubric: string
    ): string {
        return `
You are an expert UI/UX evaluator specializing in Android development and design systems.

TASK: Evaluate the quality of an Android UI recreation compared to its original Figma design using the provided rubric.

SOURCE IMAGE (Original Figma Design):
[Image data will be attached separately]

RECREATION IMAGE (Android UI Implementation):
[Image data will be attached separately]

EVALUATION RUBRIC:
${rubric}

INSTRUCTIONS:
1. Perform pixel-perfect analysis with extreme precision
2. Compare every element between source and recreation
3. Distinguish between design implementation errors and legitimate data variations
4. Apply the strict penalty system for minute differences
5. Consider Android-specific implementation quality
6. Focus on structure, layout, and design patterns rather than specific content values

Please provide a detailed evaluation following the exact output format specified in the rubric. Be thorough in your analysis and provide specific, actionable feedback with pixel-level precision.
`;
    }

    private async evaluateWithGemini(
        prompt: string, 
        sourceImage: ImageData, 
        recreationImage: ImageData
    ): Promise<string> {
        const sourceImageBase64 = this.convertToBase64(sourceImage.data);
        const recreationImageBase64 = this.convertToBase64(recreationImage.data);
        
        const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
        
        const response = await fetch(`${baseUrl}/v1beta/models/gemini-pro-vision:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.geminiApiKey}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { 
                            inline_data: { 
                                mime_type: sourceImage.mimeType || "image/png", 
                                data: sourceImageBase64 
                            } 
                        },
                        { 
                            inline_data: { 
                                mime_type: recreationImage.mimeType || "image/png", 
                                data: recreationImageBase64 
                            } 
                        }
                    ]
                }],
                generationConfig: {
                    maxOutputTokens: 4000,
                    temperature: 0.1
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(data)}`);
        }
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            throw new Error(`Unexpected Gemini API response format: ${JSON.stringify(data)}`);
        }
        
        return data.candidates[0].content.parts[0].text;
    }

    private async evaluateWithClaude(
        prompt: string, 
        sourceImage: ImageData, 
        recreationImage: ImageData
    ): Promise<string> {
        const sourceImageBase64 = this.convertToBase64(sourceImage.data);
        const recreationImageBase64 = this.convertToBase64(recreationImage.data);
        
        const baseUrl = process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com';
        const model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
        
        const response = await fetch(`${baseUrl}/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 4000,
                temperature: 0.1,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { 
                            type: 'image', 
                            source: { 
                                type: 'base64', 
                                media_type: sourceImage.mimeType || 'image/png',
                                data: sourceImageBase64 
                            } 
                        },
                        { 
                            type: 'image', 
                            source: { 
                                type: 'base64', 
                                media_type: recreationImage.mimeType || 'image/png',
                                data: recreationImageBase64 
                            } 
                        }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(data)}`);
        }
        
        if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error(`Unexpected Claude API response format: ${JSON.stringify(data)}`);
        }
        
        return data.content[0].text;
    }

    private async evaluateWithOpenAI(
        prompt: string, 
        sourceImage: ImageData, 
        recreationImage: ImageData
    ): Promise<string> {
        const sourceImageBase64 = this.convertToBase64(sourceImage.data);
        const recreationImageBase64 = this.convertToBase64(recreationImage.data);
        
        const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
        const model = process.env.OPENAI_MODEL || 'gpt-4-vision-preview';
        
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openaiApiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { 
                            type: 'image_url', 
                            image_url: { 
                                url: `data:${sourceImage.mimeType || 'image/png'};base64,${sourceImageBase64}` 
                            } 
                        },
                        { 
                            type: 'image_url', 
                            image_url: { 
                                url: `data:${recreationImage.mimeType || 'image/png'};base64,${recreationImageBase64}` 
                            } 
                        }
                    ]
                }],
                max_tokens: 4000,
                temperature: 0.1
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(data)}`);
        }
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
            throw new Error(`Unexpected OpenAI API response format: ${JSON.stringify(data)}`);
        }
        
        return data.choices[0].message.content;
    }

    private convertToBase64(data: Buffer | ArrayBuffer | string): string {
        if (typeof data === 'string') {
            if (data.startsWith('data:') || data.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
                return data.replace(/^data:[^;]+;base64,/, '');
            }
            throw new Error('String data must be base64 encoded');
        }
        
        if (data instanceof Buffer) {
            return data.toString('base64');
        }
        
        if (data instanceof ArrayBuffer) {
            return Buffer.from(data).toString('base64');
        }
        
        throw new Error('Unsupported data type for image conversion');
    }

    private parseEvaluationResult(evaluation: string): UIEvaluationResult {
        // Check if evaluation string is empty or invalid
        if (!evaluation || evaluation.trim().length === 0) {
            return {
                score: 0,
                breakdown: { layout: 0, visual: 0, content: 0 },
                strengths: [],
                improvements: ['Invalid or empty LLM response'],
                microDifferences: [],
                dataVariations: [],
                assessment: 'Evaluation failed - invalid LLM response'
            };
        }

        const scoreMatch = evaluation.match(/Score:\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

        const breakdownMatch = evaluation.match(/Breakdown:\s*[\s\S]*?Layout & Structure:\s*(\d+)[\s\S]*?Visual Design:\s*(\d+)[\s\S]*?Content & Information Architecture:\s*(\d+)/);
        
        const breakdown = {
            layout: breakdownMatch ? parseInt(breakdownMatch[1]) : 0,
            visual: breakdownMatch ? parseInt(breakdownMatch[2]) : 0,
            content: breakdownMatch ? parseInt(breakdownMatch[3]) : 0
        };

        const strengthsMatch = evaluation.match(/Key Strengths:\s*([\s\S]*?)(?=Areas for Improvement:|Micro-Differences Detected:|Data Variations Noted:|Overall Assessment:)/);
        const improvementsMatch = evaluation.match(/Areas for Improvement:\s*([\s\S]*?)(?=Micro-Differences Detected:|Data Variations Noted:|Overall Assessment:|$)/);
        const microDifferencesMatch = evaluation.match(/Micro-Differences Detected:\s*([\s\S]*?)(?=Data Variations Noted:|Overall Assessment:|$)/);
        const dataVariationsMatch = evaluation.match(/Data Variations Noted:\s*([\s\S]*?)(?=Overall Assessment:|$)/);
        const assessmentMatch = evaluation.match(/Overall Assessment:\s*([\s\S]*?)$/);

        const strengths = strengthsMatch ? strengthsMatch[1].trim().split('\n').filter(s => s.trim()) : [];
        const improvements = improvementsMatch ? improvementsMatch[1].trim().split('\n').filter(s => s.trim()) : ['Failed to parse LLM response'];
        const microDifferences = microDifferencesMatch ? microDifferencesMatch[1].trim().split('\n').filter(s => s.trim()) : [];
        const dataVariations = dataVariationsMatch ? dataVariationsMatch[1].trim().split('\n').filter(s => s.trim()) : [];
        const assessment = assessmentMatch ? assessmentMatch[1].trim() : 'Evaluation failed - could not parse LLM response';

        return {
            score,
            breakdown,
            strengths,
            improvements,
            microDifferences,
            dataVariations,
            assessment
        };
    }

    async batchEvaluate(
        evaluations: Array<{ sourceImage: ImageData; recreationImage: ImageData; name?: string }>,
        llmProvider: 'gemini' | 'claude' | 'openai' = 'claude'
    ): Promise<Array<{ name?: string; result: UIEvaluationResult }>> {
        const results: Array<{ name?: string; result: UIEvaluationResult }> = [];
        
        for (const evaluation of evaluations) {
            try {
                console.log(`Evaluating ${evaluation.name || 'unnamed'}...`);
                const result = await this.evaluateUI(
                    evaluation.sourceImage,
                    evaluation.recreationImage,
                    llmProvider
                );
                results.push({ name: evaluation.name, result });
                console.log(`Completed evaluation for ${evaluation.name || 'unnamed'}: ${result.score}/300`);
            } catch (error) {
                console.error(`Evaluation failed for ${evaluation.name || 'unnamed'}:`, error);
                
                // Extract API error information if available
                let apiError = undefined;
                if (error instanceof Error) {
                    const errorMessage = error.message;
                    if (errorMessage.includes('API error:')) {
                        const match = errorMessage.match(/(\w+) API error: (\d+) - (.+)/);
                        if (match) {
                            apiError = {
                                provider: match[1].toLowerCase(),
                                status: parseInt(match[2]),
                                message: match[3],
                                details: errorMessage
                            };
                        }
                    }
                }
                
                results.push({ 
                    name: evaluation.name, 
                    result: {
                        score: 0,
                        breakdown: { layout: 0, visual: 0, content: 0 },
                        strengths: [],
                        improvements: ['Evaluation failed - see API error details'],
                        microDifferences: [],
                        dataVariations: [],
                        assessment: 'Evaluation failed due to API error',
                        apiError
                    }
                });
            }
        }
        
        return results;
    }
}

export { UIEvaluator, UIEvaluationResult, ImageData }; 