// example-usage.ts
import { UIEvaluator, ImageData } from './ui-evaluator';
import fs from 'fs/promises';
import path from 'path';

async function exampleUsage() {
    try {
        // Check if API keys are configured
        const evaluator = new UIEvaluator();
        
        console.log('UI Evaluator Example Usage');
        console.log('==========================');
        
        // Example 1: Single image pair evaluation
        console.log('\n1. Single Image Pair Evaluation');
        console.log('--------------------------------');
        
        // Load example images (you would replace these with your actual images)
        const sourceImagePath = './images/0_source_home_page.png';
        const recreationImagePath = './images/0_generated_home_page.png';
        
        try {
            const sourceImageData = await fs.readFile(sourceImagePath);
            const recreationImageData = await fs.readFile(recreationImagePath);
            
            const sourceImage: ImageData = {
                data: sourceImageData,
                mimeType: 'image/png',
                filename: 'source_home_page.png'
            };
            
            const recreationImage: ImageData = {
                data: recreationImageData,
                mimeType: 'image/png',
                filename: 'generated_home_page.png'
            };
            
            console.log('Evaluating single image pair...');
            const result = await evaluator.evaluateUI(sourceImage, recreationImage, 'claude');
            
            if (result.score === 0 && result.apiError) {
                console.log('❌ Evaluation Failed');
                console.log(`Score: ${result.score}/300`);
                console.log(`Assessment: ${result.assessment}`);
            } else {
                console.log(`Score: ${result.score}/300`);
                console.log('Breakdown:');
                console.log(`  Layout & Structure: ${result.breakdown.layout}/100`);
                console.log(`  Visual Design: ${result.breakdown.visual}/100`);
                console.log(`  Content & Information Architecture: ${result.breakdown.content}/100`);
                
                if (result.strengths.length > 0) {
                    console.log('Key Strengths:');
                    result.strengths.forEach(strength => console.log(`  - ${strength}`));
                }
                
                if (result.improvements.length > 0) {
                    console.log('Areas for Improvement:');
                    result.improvements.forEach(improvement => console.log(`  - ${improvement}`));
                }
                
                if (result.microDifferences.length > 0) {
                    console.log('Micro-Differences Detected:');
                    result.microDifferences.forEach(diff => console.log(`  - ${diff}`));
                }
                
                if (result.dataVariations.length > 0) {
                    console.log('Data Variations Noted:');
                    result.dataVariations.forEach(variation => console.log(`  - ${variation}`));
                }
                
                console.log(`Overall Assessment: ${result.assessment}`);
            }
            
            // Display API error if present
            if (result.apiError) {
                console.log('\nAPI Error Information:');
                console.log(`  Provider: ${result.apiError.provider}`);
                console.log(`  Status: ${result.apiError.status}`);
                console.log(`  Message: ${result.apiError.message}`);
                if (result.apiError.details) {
                    console.log(`  Details: ${result.apiError.details}`);
                }
            }
            
        } catch (error) {
            console.error('Error evaluating single image pair:', error);
        }
        
        // Example 2: Batch evaluation
        console.log('\n2. Batch Evaluation');
        console.log('-------------------');
        
        try {
            const imagesDir = './images';
            const files = await fs.readdir(imagesDir);
            
            // Group files by their index
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
            
            const evaluations: Array<{ sourceImage: ImageData; recreationImage: ImageData; name?: string }> = [];
            
            for (const [index, group] of imageGroups) {
                if (group.source && group.generated) {
                    const sourceImagePath = path.join(imagesDir, group.source);
                    const generatedImagePath = path.join(imagesDir, group.generated);
                    
                    const sourceImageData = await fs.readFile(sourceImagePath);
                    const generatedImageData = await fs.readFile(generatedImagePath);
                    
                    evaluations.push({
                        sourceImage: {
                            data: sourceImageData,
                            mimeType: 'image/png',
                            filename: group.source
                        },
                        recreationImage: {
                            data: generatedImageData,
                            mimeType: 'image/png',
                            filename: group.generated
                        },
                        name: `Pair ${index}`
                    });
                }
            }
            
            if (evaluations.length > 0) {
                console.log(`Found ${evaluations.length} image pairs for batch evaluation`);
                const batchResults = await evaluator.batchEvaluate(evaluations, 'claude');
                
                console.log('\nBatch Evaluation Results:');
                batchResults.forEach((result, index) => {
                    console.log(`\n${result.name || `Pair ${index + 1}`}:`);
                    
                    if (result.result.score === 0 && result.result.apiError) {
                        console.log(`  ❌ Evaluation Failed`);
                        console.log(`  Score: ${result.result.score}/300`);
                        console.log(`  Assessment: ${result.result.assessment}`);
                        console.log(`  API Error: ${result.result.apiError.provider} (${result.result.apiError.status}) - ${result.result.apiError.message}`);
                    } else {
                        console.log(`  Score: ${result.result.score}/300`);
                        console.log(`  Layout: ${result.result.breakdown.layout}/100`);
                        console.log(`  Visual: ${result.result.breakdown.visual}/100`);
                        console.log(`  Content: ${result.result.breakdown.content}/100`);
                        
                        // Display API error if present
                        if (result.result.apiError) {
                            console.log(`  API Error: ${result.result.apiError.provider} (${result.result.apiError.status}) - ${result.result.apiError.message}`);
                        }
                    }
                });
                
                // Calculate averages
                const totalScore = batchResults.reduce((sum, result) => sum + result.result.score, 0);
                const averageScore = totalScore / batchResults.length;
                console.log(`\nAverage Score: ${averageScore.toFixed(1)}/300`);
            } else {
                console.log('No image pairs found for batch evaluation');
            }
            
        } catch (error) {
            console.error('Error during batch evaluation:', error);
        }
        
        // Example 3: Different LLM providers
        console.log('\n3. Using Different LLM Providers');
        console.log('--------------------------------');
        
        const providers: Array<'claude' | 'openai' | 'gemini'> = ['claude', 'openai', 'gemini'];
        
        for (const provider of providers) {
            try {
                console.log(`\nTesting ${provider.toUpperCase()} provider...`);
                
                // You would load your test images here
                const testSourceImage: ImageData = {
                    data: Buffer.from('test'), // Replace with actual image data
                    mimeType: 'image/png',
                    filename: 'test_source.png'
                };
                
                const testRecreationImage: ImageData = {
                    data: Buffer.from('test'), // Replace with actual image data
                    mimeType: 'image/png',
                    filename: 'test_recreation.png'
                };
                
                const result = await evaluator.evaluateUI(testSourceImage, testRecreationImage, provider);
                
                if (result.score === 0 && result.apiError) {
                    console.log(`${provider.toUpperCase()}: ❌ Evaluation Failed`);
                    console.log(`  API Error: ${result.apiError.provider} (${result.apiError.status}) - ${result.apiError.message}`);
                } else {
                    console.log(`${provider.toUpperCase()} Score: ${result.score}/300`);
                    
                    // Display API error if present
                    if (result.apiError) {
                        console.log(`  API Error: ${result.apiError.provider} (${result.apiError.status}) - ${result.apiError.message}`);
                    }
                }
                
            } catch (error) {
                console.error(`Error with ${provider} provider:`, error);
            }
        }
        
    } catch (error) {
        console.error('Example usage failed:', error);
    }
}

// Configuration check
function checkConfiguration() {
    console.log('Configuration Check');
    console.log('==================');
    
    const requiredEnvVars = [
        'CLAUDE_API_KEY',
        'OPENAI_API_KEY', 
        'GEMINI_API_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log('Missing environment variables:');
        missingVars.forEach(varName => console.log(`  - ${varName}`));
        console.log('\nPlease set these in your .env file:');
        console.log('CLAUDE_API_KEY=your_claude_api_key');
        console.log('OPENAI_API_KEY=your_openai_api_key');
        console.log('GEMINI_API_KEY=your_gemini_api_key');
        console.log('\nOptional environment variables:');
        console.log('CLAUDE_BASE_URL=https://api.anthropic.com');
        console.log('OPENAI_BASE_URL=https://api.openai.com');
        console.log('GEMINI_BASE_URL=https://generativelanguage.googleapis.com');
        console.log('CLAUDE_MODEL=claude-3-sonnet-20240229');
        console.log('OPENAI_MODEL=gpt-4-vision-preview');
        return false;
    } else {
        console.log('✓ All required environment variables are set');
        return true;
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    if (checkConfiguration()) {
        exampleUsage();
    } else {
        console.log('\nPlease configure your environment variables before running the example.');
    }
}

export { exampleUsage, checkConfiguration }; 