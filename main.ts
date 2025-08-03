// main.ts
import { UIEvaluator } from './ui-evaluator';
import fs from 'fs/promises';
import path from 'path';

interface ImagePair {
    sourceImage: ImageData;
    recreationImage: ImageData;
    name?: string;
}

interface ImageData {
    data: Buffer;
    mimeType: string;
    filename: string;
}

async function loadImagePairs(): Promise<ImagePair[]> {
    const imagesDir = './images';
    const files = await fs.readdir(imagesDir);
    
    const imageGroups = new Map<string, { source?: string; generated?: string }>();
    
    for (const file of files) {
        if (file.endsWith('.png')) {
            const parts = file.split('_');
            if (parts.length >= 3) {
                const index = parts[0];
                const type = parts[1];
                
                if (!imageGroups.has(index)) {
                    imageGroups.set(index, {});
                }
                
                const group = imageGroups.get(index)!;
                if (type === 'source') {
                    group.source = file;
                } else if (type === 'generated') {
                    group.generated = file;
                }
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
                name: `Pair ${index}`
            });
        }
    }
    
    return imagePairs;
}

async function main() {
    console.log('=== UI Evaluator Test ===');
    
    try {
        console.log('Loading image pairs...');
        const imagePairs = await loadImagePairs();
        
        if (imagePairs.length === 0) {
            console.log('No image pairs found. Creating test data...');
            
            // Create test data
            const testImageData = Buffer.from('test image data');
            const testImage: ImageData = {
                data: testImageData,
                mimeType: 'image/png',
                filename: 'test.png'
            };
            
            imagePairs.push({
                sourceImage: testImage,
                recreationImage: testImage,
                name: 'Test Pair'
            });
        }
        
        console.log(`Found ${imagePairs.length} image pairs:`);
        imagePairs.forEach((pair, index) => {
            console.log(`  ${index + 1}. ${pair.name}: ${pair.sourceImage.filename} ↔ ${pair.recreationImage.filename}`);
        });
        
        console.log('\nInitializing UI Evaluator...');
        const evaluator = new UIEvaluator();
        
        console.log('Starting evaluation...');
        const results = await evaluator.batchEvaluate(imagePairs, 'gemini');
        
        console.log('\n=== EVALUATION RESULTS ===');
        results.forEach((result, index) => {
            console.log(`\n${result.name || `Pair ${index + 1}`}:`);
            
            if (result.result.score === 0 && result.result.apiError) {
                console.log(`  ❌ Evaluation Failed`);
                console.log(`  Score: ${result.result.score}/300`);
                console.log(`  Assessment: ${result.result.assessment}`);
                console.log(`  API Error Information:`);
                console.log(`    Provider: ${result.result.apiError.provider}`);
                console.log(`    Status: ${result.result.apiError.status}`);
                console.log(`    Message: ${result.result.apiError.message}`);
                if (result.result.apiError.details) {
                    console.log(`    Details: ${result.result.apiError.details}`);
                }
            } else {
                console.log(`  Score: ${result.result.score}/300`);
                console.log(`  Breakdown:`);
                console.log(`    Layout & Structure: ${result.result.breakdown.layout}/100`);
                console.log(`    Visual Design: ${result.result.breakdown.visual}/100`);
                console.log(`    Content & Information Architecture: ${result.result.breakdown.content}/100`);
                
                if (result.result.strengths.length > 0) {
                    console.log(`  Key Strengths:`);
                    result.result.strengths.forEach(strength => console.log(`    - ${strength}`));
                }
                
                if (result.result.improvements.length > 0) {
                    console.log(`  Areas for Improvement:`);
                    result.result.improvements.forEach(improvement => console.log(`    - ${improvement}`));
                }
                
                if (result.result.microDifferences.length > 0) {
                    console.log(`  Micro-Differences Detected:`);
                    result.result.microDifferences.forEach(diff => console.log(`    - ${diff}`));
                }
                
                if (result.result.dataVariations.length > 0) {
                    console.log(`  Data Variations Noted:`);
                    result.result.dataVariations.forEach(variation => console.log(`    - ${variation}`));
                }
                
                console.log(`  Overall Assessment: ${result.result.assessment}`);
                
                // Display API error if present
                if (result.result.apiError) {
                    console.log(`  API Error Information:`);
                    console.log(`    Provider: ${result.result.apiError.provider}`);
                    console.log(`    Status: ${result.result.apiError.status}`);
                    console.log(`    Message: ${result.result.apiError.message}`);
                    if (result.result.apiError.details) {
                        console.log(`    Details: ${result.result.apiError.details}`);
                    }
                }
            }
        });
        
        const totalScore = results.reduce((sum, result) => sum + result.result.score, 0);
        const averageScore = totalScore / results.length;
        console.log(`\n=== SUMMARY ===`);
        console.log(`Average Score: ${averageScore.toFixed(1)}/300`);
        console.log(`Total Evaluations: ${results.length}`);
        
    } catch (error) {
        console.error('Error during evaluation:', error);
    }
}

main();