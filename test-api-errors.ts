// test-api-errors.ts
import { UIEvaluator, ImageData } from './ui-evaluator';

async function testApiErrorHandling() {
    console.log('Testing API Error Handling...');
    console.log('============================');
    
    const evaluator = new UIEvaluator();
    
    // Test with invalid API keys to trigger errors
    const testImage: ImageData = {
        data: Buffer.from('test image data'),
        mimeType: 'image/png',
        filename: 'test.png'
    };
    
    const providers: Array<'claude' | 'openai' | 'gemini'> = ['claude', 'openai', 'gemini'];
    
    for (const provider of providers) {
        console.log(`\nTesting ${provider.toUpperCase()} with invalid API key...`);
        
        try {
            const result = await evaluator.evaluateUI(testImage, testImage, provider);
            
            if (result.score === 0 && result.apiError) {
                console.log('❌ Evaluation Failed as Expected');
                console.log(`Score: ${result.score}/300`);
                console.log(`Assessment: ${result.assessment}`);
                console.log('✓ API Error captured successfully:');
                console.log(`  Provider: ${result.apiError.provider}`);
                console.log(`  Status: ${result.apiError.status}`);
                console.log(`  Message: ${result.apiError.message}`);
                if (result.apiError.details) {
                    console.log(`  Details: ${result.apiError.details}`);
                }
            } else if (result.score > 0) {
                console.log('⚠ Evaluation succeeded unexpectedly');
                console.log(`Score: ${result.score}/300`);
            } else {
                console.log('❌ Evaluation failed but no API error captured');
                console.log(`Score: ${result.score}/300`);
                console.log(`Assessment: ${result.assessment}`);
            }
            
        } catch (error) {
            console.error(`✗ Unexpected error with ${provider}:`, error);
        }
    }
    
    console.log('\n=== API Error Handling Test Complete ===');
    console.log('The evaluator should now properly capture and display API errors.');
}

// Run the test if this file is executed directly
if (require.main === module) {
    testApiErrorHandling();
}

export { testApiErrorHandling }; 