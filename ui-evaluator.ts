import { GoogleGenerativeAI } from "@google/generative-ai";
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
    subcategoryScores: {
        layout: { [key: string]: number };
        visual: { [key: string]: number };
        content: { [key: string]: number };
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
    private generativeAi: GoogleGenerativeAI;

    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY || '';
        this.claudeApiKey = process.env.CLAUDE_API_KEY || '';
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.generativeAi = new GoogleGenerativeAI(this.geminiApiKey);
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
                subcategoryScores: { layout: {}, visual: {}, content: {} },
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
            console.error('Error loading rubric:', error);
            throw error;
        }
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

Please provide a detailed evaluation following the exact output format specified in the rubric. Be thorough in your analysis and provide specific, actionable feedback with pixel-level precision.
`;
    }

    private async evaluateWithGemini(
        prompt: string,
        sourceImage: ImageData,
        recreationImage: ImageData
    ): Promise<string> {
        const modelName = process.env.GEMINI_MODEL

        if (!modelName) throw new Error("GEMINI_MODEL is not set");
        const model = this.generativeAi.getGenerativeModel({ model: modelName });

        const imageParts = [
            this.fileToGenerativePart(sourceImage.data, sourceImage.mimeType || "image/png"),
            this.fileToGenerativePart(recreationImage.data, recreationImage.mimeType || "image/png"),
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        return response.text();
    }

    private fileToGenerativePart(data: Buffer | ArrayBuffer | string, mimeType: string) {
        return {
            inlineData: {
                data: this.convertToBase64(data),
                mimeType
            },
        };
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

    public getScoreFromEvaluation(evaluation: string): number {
        const cleanedEvaluation = evaluation.replace(/```/g, '');
        const scoreMatch = cleanedEvaluation.match(/Score:\s*(\d+)/);
        return scoreMatch ? parseInt(scoreMatch[1]) : 0;
    }

    private parseEvaluationResult(evaluation: string): UIEvaluationResult {
        // Check if evaluation string is empty or invalid
        if (!evaluation || evaluation.trim().length === 0) {
            return {
                score: 0,
                breakdown: { layout: 0, visual: 0, content: 0 },
                subcategoryScores: { layout: {}, visual: {}, content: {} },
                strengths: [],
                improvements: ['Invalid or empty LLM response'],
                microDifferences: [],
                dataVariations: [],
                assessment: 'Evaluation failed - invalid LLM response'
            };
        }

        const cleanedEvaluation = evaluation.replace(/```/g, '');
        const score = this.getScoreFromEvaluation(cleanedEvaluation);

        const breakdownMatch = cleanedEvaluation.match(/Breakdown:\s*[\s\S]*?Layout & Structure:\s*(\d+)[\s\S]*?Visual Design:\s*(\d+)[\s\S]*?Content & Information Architecture:\s*(\d+)/);
        
        const breakdown = {
            layout: breakdownMatch ? parseInt(breakdownMatch[1]) : 0,
            visual: breakdownMatch ? parseInt(breakdownMatch[2]) : 0,
            content: breakdownMatch ? parseInt(breakdownMatch[3]) : 0
        };

        const subcategoryScores = {
            layout: this.parseSubcategoryTable(cleanedEvaluation, "Layout & Structure"),
            visual: this.parseSubcategoryTable(cleanedEvaluation, "Visual Design"),
            content: this.parseSubcategoryTable(cleanedEvaluation, "Content & Information Architecture"),
        };

        const strengthsMatch = cleanedEvaluation.match(/Key Strengths:\s*([\s\S]*?)(?=Areas for Improvement:|Micro-Differences Detected:|Data Variations Noted:|Overall Assessment:)/);
        const improvementsMatch = cleanedEvaluation.match(/Areas for Improvement:\s*([\s\S]*?)(?=Micro-Differences Detected:|Data Variations Noted:|Overall Assessment:|$)/);
        const microDifferencesMatch = cleanedEvaluation.match(/Micro-Differences Detected:\s*([\s\S]*?)(?=Data Variations Noted:|Overall Assessment:|$)/);
        const dataVariationsMatch = cleanedEvaluation.match(/Data Variations Noted:\s*([\s\S]*?)(?=Overall Assessment:|$)/);
        const assessmentMatch = cleanedEvaluation.match(/Overall Assessment:\s*([\s\S]*?)$/);

        const strengths = strengthsMatch ? strengthsMatch[1].trim().split('\n').filter(s => s.trim()) : [];
        const improvements = improvementsMatch ? improvementsMatch[1].trim().split('\n').filter(s => s.trim()) : ['Failed to parse LLM response'];
        const microDifferences = microDifferencesMatch ? microDifferencesMatch[1].trim().split('\n').filter(s => s.trim()) : [];
        const dataVariations = dataVariationsMatch ? dataVariationsMatch[1].trim().split('\n').filter(s => s.trim()) : [];
        const assessment = assessmentMatch ? assessmentMatch[1].trim() : 'Evaluation failed - could not parse LLM response';

        return {
            score,
            breakdown,
            subcategoryScores,
            strengths,
            improvements,
            microDifferences,
            dataVariations,
            assessment
        };
    }

    private parseSubcategoryTable(evaluation: string, category: string): { [key: string]: number } {
        const scores: { [key: string]: number } = {};
        const tableRegex = new RegExp(`- \\*\\*${category}\\*\\*\\s*\\n(\\|[\\s\\S]*?)\\|\\s*\\n`, "m");
        const tableMatch = evaluation.match(tableRegex);
    
        if (tableMatch) {
            const tableRows = tableMatch[1].trim().split('\n').slice(2); // Skip header and separator
            for (const row of tableRows) {
                const columns = row.split('|').map(c => c.trim());
                if (columns.length >= 3) {
                    const subcategory = columns[1];
                    const scoreMatch = columns[2].match(/(\d+)/);
                    if (subcategory && scoreMatch) {
                        scores[subcategory] = parseInt(scoreMatch[1]);
                    }
                }
            }
        }
        return scores;
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
                        subcategoryScores: { layout: {}, visual: {}, content: {} },
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

    async writeMarkdownReport(
        results: Array<{ name?: string; result: UIEvaluationResult }>,
        provider: 'gemini' | 'claude' | 'openai',
        outputPath: string
    ): Promise<void> {
        let markdown = `# UI Evaluation Report\n\n`;
        markdown += `**LLM Provider:** ${provider.toUpperCase()}\n`;
        markdown += `**Date:** ${new Date().toISOString()}\n\n`;

        results.forEach((result, index) => {
            markdown += `## ${result.name || `Pair ${index + 1}`}\n\n`;
            
            if (result.result.score === 0 && result.result.apiError) {
                markdown += `**Score:** ${result.result.score}/300\n\n`;
                markdown += `**Assessment:** ${result.result.assessment}\n\n`;
                markdown += `**API Error:**\n`;
                markdown += `*   **Provider:** ${result.result.apiError.provider}\n`;
                markdown += `*   **Status:** ${result.result.apiError.status}\n`;
                markdown += `*   **Message:** ${result.result.apiError.message}\n`;
            } else {
                markdown += `**Score:** ${result.result.score}/300\n\n`;
                markdown += `**Breakdown:**\n`;
                markdown += `*   **Layout & Structure:** ${result.result.breakdown.layout}/100\n`;
                markdown += `*   **Visual Design:** ${result.result.breakdown.visual}/100\n`;
                markdown += `*   **Content & Information Architecture:** ${result.result.breakdown.content}/100\n\n`;

                markdown += `**Subcategory Scores:**\n\n`;

                markdown += `*   **Layout & Structure**\n`;
                markdown += `| Subcategory | Score |\n`;
                markdown += `| --- | --- |\n`;
                if (result.result.subcategoryScores.layout) {
                    for (const [key, value] of Object.entries(result.result.subcategoryScores.layout)) {
                        markdown += `| ${key} | ${value} |\n`;
                    }
                }
                markdown += `\n`;

                markdown += `*   **Visual Design**\n`;
                markdown += `| Subcategory | Score |\n`;
                markdown += `| --- | --- |\n`;
                if (result.result.subcategoryScores.visual) {
                    for (const [key, value] of Object.entries(result.result.subcategoryScores.visual)) {
                        markdown += `| ${key} | ${value} |\n`;
                    }
                }
                markdown += `\n`;

                markdown += `*   **Content & Information Architecture**\n`;
                markdown += `| Subcategory | Score |\n`;
                markdown += `| --- | --- |\n`;
                if (result.result.subcategoryScores.content) {
                    for (const [key, value] of Object.entries(result.result.subcategoryScores.content)) {
                        markdown += `| ${key} | ${value} |\n`;
                    }
                }
                markdown += `\n`;

                markdown += `**Key Strengths:**\n`;
                result.result.strengths.forEach(strength => {
                    markdown += `*   ${strength}\n`;
                });
                markdown += `\n`;

                markdown += `**Areas for Improvement:**\n`;
                result.result.improvements.forEach(improvement => {
                    markdown += `*   ${improvement}\n`;
                });
                markdown += `\n`;

                markdown += `**Micro-Differences Detected:**\n`;
                result.result.microDifferences.forEach(diff => {
                    markdown += `*   ${diff}\n`;
                });
                markdown += `\n`;

                markdown += `**Data Variations Noted:**\n`;
                result.result.dataVariations.forEach(variation => {
                    markdown += `*   ${variation}\n`;
                });
                markdown += `\n`;

                markdown += `**Overall Assessment:**\n`;
                markdown += `${result.result.assessment}\n\n`;
            }
        });

        await fs.writeFile(outputPath, markdown);
        console.log(`\nMarkdown report written to ${outputPath}`);
    }
}

export { UIEvaluator, UIEvaluationResult, ImageData }; 