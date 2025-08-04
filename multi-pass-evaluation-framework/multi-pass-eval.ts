// multi-pass-evaluation-framework/multi-pass-eval.ts
import { ImageData } from "../ui-evaluator";
import * as rubric from './atomic-rubric-constants';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from 'dotenv';
import { marked } from 'marked';
import { buildSubcategoryPrompt } from './subcategory-prompt';

interface ImagePair {
    sourceImage: ImageData;
    recreationImage: ImageData;
    name?: string;
}

dotenv.config();

// Helper function to call Gemini, adapted from UIEvaluator
const geminiApiKey = process.env.GEMINI_API_KEY || '';
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}
const generativeAi = new GoogleGenerativeAI(geminiApiKey);

const temperature = 0.0;
const topP = 1.0;

async function loadImagePairs(): Promise<ImagePair[]> {
    const imagesDir = './images';
    const files = await fs.readdir(imagesDir);
    
    const imageGroups = new Map<string, { source?: string; generated?: string; description?: string }>();
    
    for (const file of files) {
        if (file.endsWith('.png')) {
            const parts = file.split('_');
            if (parts.length >= 3) {
                const index = parts[0];
                const type = parts[1];
                const description = parts.slice(2).join('_').replace('.png', '');
                
                if (!imageGroups.has(index)) {
                    imageGroups.set(index, {});
                }
                
                const group = imageGroups.get(index)!;
                if (type === 'source') {
                    group.source = file;
                } else if (type === 'generated') {
                    group.generated = file;
                }
                group.description = description;
            }
        }
    }
    
    const imagePairs: ImagePair[] = [];
    
    for (const [index, group] of imageGroups) {
        if (group.source && group.generated) {
            const sourceImagePath = path.join(imagesDir, group.source);
            const generatedImagePath = path.join(imagesDir, group.generated);
            
            const sourceImageData = await fs.readFile(sourceImagePath);
            const generatedImageData = await fs.readFile(generatedImagePath);
            
            const sourceImage: ImageData = {
                data: sourceImageData,
                mimeType: 'image/png',
                filename: group.source
            };
            
            const recreationImage: ImageData = {
                data: generatedImageData,
                mimeType: 'image/png',
                filename: group.generated
            };
            
            imagePairs.push({
                sourceImage,
                recreationImage,
                name: `Pair ${index}: ${group.description}`
            });
        }
    }
    
    return imagePairs;
}

function convertToBase64(data: Buffer | ArrayBuffer | string): string {
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

function fileToGenerativePart(data: Buffer | ArrayBuffer | string, mimeType: string) {
    return {
        inlineData: {
            data: convertToBase64(data),
            mimeType
        },
    };
}

async function evaluateWithGemini(
    prompt: string,
    sourceImage: ImageData,
    recreationImage: ImageData
): Promise<string> {
    const modelName = 'gemini-2.5-pro';
    if (!modelName) throw new Error("GEMINI_MODEL is not set");
    
    const model = generativeAi.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
            temperature,
            topP,
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    });

    const imageParts = [
        fileToGenerativePart(sourceImage.data, sourceImage.mimeType || "image/png"),
        fileToGenerativePart(recreationImage.data, recreationImage.mimeType || "image/png"),
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    return response.text();
}

interface SubcategoryEvalResult {
    score: number;
    reasoning: string;
}

interface CategoryResult {
    score: number;
    maxPoints: number;
    subcategories: Record<string, SubcategoryEvalResult>;
}

interface PairResult {
    name: string;
    text: CategoryResult;
    color: CategoryResult;
    sizing: CategoryResult;
    spacing: CategoryResult;
    structure: CategoryResult;
    style: CategoryResult;
    sourceImageFilename?: string;
    recreationImageFilename?: string;
}

async function runEvaluation(imagePairs: ImagePair[]): Promise<PairResult[]> {
    const allEvaluationPromises = [];

    for (const pair of imagePairs) {
        const allCategories = [
            { name: 'text', subcategories: rubric.textAndTypographySubcategories, key: 'text' as const },
            { name: 'color', subcategories: rubric.colorAndFillSubcategories, key: 'color' as const },
            { name: 'sizing', subcategories: rubric.sizingAndDimensionSubcategories, key: 'sizing' as const },
            { name: 'spacing', subcategories: rubric.spacingAndPositioningSubcategories, key: 'spacing' as const },
            { name: 'structure', subcategories: rubric.structureAndHierarchySubcategories, key: 'structure' as const },
            { name: 'style', subcategories: rubric.stylingAndEffectsSubcategories, key: 'style' as const },
        ];

        for (const category of allCategories) {
            for (const subcategory of category.subcategories) {
                const promise = (async () => {
                    const prompt = buildSubcategoryPrompt(subcategory);
                    try {
                        const responseText = await evaluateWithGemini(prompt, pair.sourceImage, pair.recreationImage);
                        const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                        const result: SubcategoryEvalResult = JSON.parse(cleanedResponse);
                        return { 
                            pairName: pair.name || 'Unnamed Pair', 
                            categoryKey: category.key, 
                            subcategoryKey: subcategory.key, 
                            result, 
                            subcategory,
                            sourceImageFilename: pair.sourceImage.filename,
                            recreationImageFilename: pair.recreationImage.filename
                        };
                    } catch (e) {
                        console.error(`    Error evaluating subcategory ${subcategory.key} for ${pair.name}:`, e);
                        const result: SubcategoryEvalResult = {
                            score: 0,
                            reasoning: `Evaluation failed: ${e instanceof Error ? e.message : String(e)}`,
                        };
                        return { 
                            pairName: pair.name || 'Unnamed Pair', 
                            categoryKey: category.key, 
                            subcategoryKey: subcategory.key, 
                            result, 
                            subcategory,
                            sourceImageFilename: pair.sourceImage.filename,
                            recreationImageFilename: pair.recreationImage.filename
                        };
                    }
                })();
                allEvaluationPromises.push(promise);
            }
        }

        console.log(`In progress: ${pair.name} evaluation`);
    }

    const evaluationResults = await Promise.all(allEvaluationPromises);

    const allResults: Record<string, PairResult> = {};

    for (const evalResult of evaluationResults) {
        if (!allResults[evalResult.pairName]) {
            allResults[evalResult.pairName] = {
                name: evalResult.pairName,
                text: { score: 0, maxPoints: 0, subcategories: {} },
                color: { score: 0, maxPoints: 0, subcategories: {} },
                sizing: { score: 0, maxPoints: 0, subcategories: {} },
                spacing: { score: 0, maxPoints: 0, subcategories: {} },
                structure: { score: 0, maxPoints: 0, subcategories: {} },
                style: { score: 0, maxPoints: 0, subcategories: {} },
                sourceImageFilename: evalResult.sourceImageFilename,
                recreationImageFilename: evalResult.recreationImageFilename
            };
        }

        const pairResult = allResults[evalResult.pairName]!;
        const categoryResult = pairResult[evalResult.categoryKey];
        categoryResult.subcategories[evalResult.subcategoryKey] = evalResult.result;
        categoryResult.score += evalResult.result.score;
        categoryResult.maxPoints += evalResult.subcategory.maxPoints;
    }

    return Object.values(allResults);
}

function generateMarkdownForPair(result: PairResult): string {
    let markdown = `## ${result.name}\n\n`;
    const totalScore = result.text.score + result.color.score + result.sizing.score + result.spacing.score + result.structure.score + result.style.score;
    const totalMaxPoints = result.text.maxPoints + result.color.maxPoints + result.sizing.maxPoints + result.spacing.maxPoints + result.structure.maxPoints + result.style.maxPoints;
    markdown += `**Total Score: ${totalScore} / ${totalMaxPoints}**\n\n`;

    markdown += `### Category Scores\n`;
    markdown += `| Category | Score |\n`;
    markdown += `| --- | --- |\n`;
    markdown += `| Text & Typography | ${result.text.score} / ${result.text.maxPoints} |\n`;
    markdown += `| Color & Fill | ${result.color.score} / ${result.color.maxPoints} |\n`;
    markdown += `| Sizing & Dimension | ${result.sizing.score} / ${result.sizing.maxPoints} |\n`;
    markdown += `| Spacing & Positioning | ${result.spacing.score} / ${result.spacing.maxPoints} |\n`;
    markdown += `| Structure & Hierarchy | ${result.structure.score} / ${result.structure.maxPoints} |\n`;
    markdown += `| Styling & Effects | ${result.style.score} / ${result.style.maxPoints} |\n\n`;
    
    markdown += `### Detailed Breakdown\n`;
    
    const allCategories: {name: string; key: 'text' | 'color' | 'sizing' | 'spacing' | 'structure' | 'style'}[] = [
        { name: 'Text & Typography', key: 'text' },
        { name: 'Color & Fill', key: 'color' },
        { name: 'Sizing & Dimension', key: 'sizing' },
        { name: 'Spacing & Positioning', key: 'spacing' },
        { name: 'Structure & Hierarchy', key: 'structure' },
        { name: 'Styling & Effects', key: 'style' },
    ];
    
    for (const category of allCategories) {
        markdown += `#### ${category.name}\n`;
        markdown += `| Subcategory | Score | Max Points | Reasoning |\n`;
        markdown += `| --- | --- | --- | --- |\n`;
        const subcategoryResults = result[category.key].subcategories;
        const subcategoryDefinitions = rubricMap[category.key];
        
        for(const subcatDef of subcategoryDefinitions) {
            const subcatResult = subcategoryResults[subcatDef.key];
            if (subcatResult) {
                 markdown += `| ${subcatDef.key} | ${subcatResult.score} | ${subcatDef.maxPoints} | ${subcatResult.reasoning.replace(/\n/g, '<br/>')} |\n`;
            }
        }
        markdown += '\n';
    }
    return markdown;
}

async function generateReport(results: PairResult[]): Promise<{ reportPath: string; timestamp: string, markdown: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let markdown = `# Multi-Pass UI Evaluation Report\n\n`;
    markdown += `**LLM Provider:** Gemini\n`;
    markdown += `**Date:** ${new Date().toISOString()}\n\n`;

    const pairMarkdowns = results.map(result => generateMarkdownForPair(result));
    markdown += pairMarkdowns.join('\n\n');
    
    const reportPath = path.join('output', `report-gemini-multi-pass-${timestamp}.md`);
    
    await fs.writeFile(reportPath, markdown);
    console.log(`\nMarkdown report written to ${reportPath}`);

    return { reportPath, timestamp, markdown };
}

async function generateHtmlGallery(results: PairResult[], timestamp: string) {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UI Comparison Gallery - Gemini Multi-Pass - ${timestamp}</title>
        <style>
          body { font-family: sans-serif; margin: 2em; }
          .comparison-container {
            display: grid;
            grid-template-columns: 1fr 1fr 3fr;
            border: 1px solid #ccc;
            padding: 1em;
            margin-bottom: 2em;
            align-items: start;
            gap: 1em;
          }
          .image-container {
            text-align: center;
          }
          .report-container {
            border-left: 1px solid #ccc;
            padding-left: 1em;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          img {
            border: 1px solid #ddd;
            width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <h1>UI Comparison Gallery (Multi-Pass)</h1>
        <h2>Provider: Gemini</h2>
        <h3>Timestamp: ${timestamp}</h3>
    `;
  
    for (const result of results) {
        const reportHtml = marked(generateMarkdownForPair(result));
        const sourceImageRelative = path.relative('gallery_output', path.join('images', result.sourceImageFilename || ''));
        const generatedImageRelative = path.relative('gallery_output', path.join('images', result.recreationImageFilename || ''));

        const pairIdMatch = result.name.match(/Pair (\d+):/);
        const pairId = pairIdMatch ? pairIdMatch[1] : 'N/A';
    
        html += `
          <div class="comparison-container">
            <div class="image-container">
              <h3>Generated (Pair ${pairId})</h3>
              <img src="${generatedImageRelative}" alt="Generated Image ${pairId}">
            </div>
            <div class="image-container">
              <h3>Source (Pair ${pairId})</h3>
              <img src="${sourceImageRelative}" alt="Source Image ${pairId}">
            </div>
            <div class="report-container">
              ${reportHtml}
            </div>
          </div>
        `;
    }
  
    html += `
      </body>
      </html>
    `;
    
    const outputDir = 'gallery_output';
    await fs.mkdir(outputDir, { recursive: true });

    const outputFilename = `gallery-gemini-multi-pass-${timestamp}.html`;
    const outputPath = path.join(outputDir, outputFilename);
    await fs.writeFile(outputPath, html);
    
    console.log(`Gallery generated successfully: ${outputPath}`);
}


async function main() {
    console.log('=== Multi-Pass UI Evaluator ===');
    console.log(`Using provider: gemini`);

    const imagePairs = await loadImagePairs();
    if (imagePairs.length === 0) {
        console.log('No image pairs found in ./images. Exiting.');
        return;
    }
    console.log(`Found ${imagePairs.length} image pairs to evaluate.`);

    console.log(`Evaluating ${imagePairs.length} image pairs...`);
    const allResults = await runEvaluation(imagePairs);
    
    console.log(`Evaluation complete. Generating report...`);

    const { timestamp } = await generateReport(allResults);

    console.log(`Generating gallery...`);
    await generateHtmlGallery(allResults, timestamp);
}

const rubricMap = {
    text: rubric.textAndTypographySubcategories,
    color: rubric.colorAndFillSubcategories,
    sizing: rubric.sizingAndDimensionSubcategories,
    spacing: rubric.spacingAndPositioningSubcategories,
    structure: rubric.structureAndHierarchySubcategories,
    style: rubric.stylingAndEffectsSubcategories,
};


await main().catch(console.error);
