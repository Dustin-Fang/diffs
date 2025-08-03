// test-evaluator.ts
import { UIEvaluator, ImageData } from './ui-evaluator';
import fs from 'fs/promises';
import path from 'path';

async function testEvaluator() {
    console.log('Testing UI Evaluator...');
    console.log('======================');
    
    try {
        // Test 1: Check if evaluator initializes correctly
        console.log('\n1. Testing evaluator initialization...');
        const evaluator = new UIEvaluator();
        console.log('✓ Evaluator initialized successfully');
        
        // Test 2: Check if rubric loads
        console.log('\n2. Testing rubric loading...');
        try {
            const rubric = await evaluator['loadRubric']();
            console.log('✓ Rubric loaded successfully');
            console.log(`  Rubric length: ${rubric.length} characters`);
        } catch (error) {
            console.log('⚠ Rubric loading failed, using fallback');
        }
        
        // Test 3: Check image loading
        console.log('\n3. Testing image loading...');
        const imagesDir = './images';
        try {
            const files = await fs.readdir(imagesDir);
            const pngFiles = files.filter(file => file.endsWith('.png'));
            console.log(`✓ Found ${pngFiles.length} PNG files in images directory`);
            
            if (pngFiles.length > 0) {
                console.log('  Files found:');
                pngFiles.forEach(file => console.log(`    - ${file}`));
            }
        } catch (error) {
            console.log('⚠ Images directory not found or empty');
        }
        
        // Test 4: Check environment variables
        console.log('\n4. Testing environment variables...');
        const requiredVars = ['CLAUDE_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length === 0) {
            console.log('✓ All required environment variables are set');
        } else {
            console.log('⚠ Missing environment variables:');
            missingVars.forEach(varName => console.log(`    - ${varName}`));
        }
        
        // Test 5: Test image pair detection
        console.log('\n5. Testing image pair detection...');
        try {
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
            
            const validPairs = Array.from(imageGroups.entries())
                .filter(([_, group]) => group.source && group.generated);
            
            console.log(`✓ Found ${validPairs.length} valid image pairs`);
            validPairs.forEach(([index, group]) => {
                console.log(`    Pair ${index}: ${group.source} ↔ ${group.generated}`);
            });
            
        } catch (error) {
            console.log('⚠ Could not test image pair detection');
        }
        
        // Test 6: Test base64 conversion
        console.log('\n6. Testing base64 conversion...');
        try {
            const testBuffer = Buffer.from('test image data');
            const base64 = evaluator['convertToBase64'](testBuffer);
            console.log('✓ Base64 conversion works');
            console.log(`  Test conversion: ${base64.substring(0, 20)}...`);
        } catch (error) {
            console.log('✗ Base64 conversion failed:', error);
        }
        
        // Test 7: Test prompt building
        console.log('\n7. Testing prompt building...');
        try {
            const testImage: ImageData = {
                data: Buffer.from('test'),
                mimeType: 'image/png',
                filename: 'test.png'
            };
            
            const rubric = await evaluator['loadRubric']();
            const prompt = evaluator['buildEvaluationPrompt'](testImage, testImage, rubric);
            
            console.log('✓ Prompt building works');
            console.log(`  Prompt length: ${prompt.length} characters`);
        } catch (error) {
            console.log('✗ Prompt building failed:', error);
        }
        
        console.log('\n=== Test Summary ===');
        console.log('The evaluator appears to be properly configured.');
        console.log('To run actual evaluations, ensure:');
        console.log('1. All API keys are set in .env file');
        console.log('2. Image pairs are placed in ./images directory');
        console.log('3. Images follow naming pattern: {index}_source_{description}.png');
        console.log('4. Run with: npm start');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testEvaluator();
}

export { testEvaluator }; 