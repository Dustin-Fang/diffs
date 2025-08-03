# UI Recreation Evaluator

A comprehensive tool for evaluating the quality of UI recreations by comparing LLM-generated Android UI against original Figma designs using advanced LLM vision models.

## Features

- **Multi-LLM Support**: Evaluate using Claude, OpenAI GPT-4 Vision, or Google Gemini
- **Detailed Rubric**: Uses a comprehensive 300-point evaluation rubric with pixel-perfect analysis
- **Data-Aware Evaluation**: Distinguishes between design implementation errors and legitimate data variations
- **Batch Processing**: Evaluate multiple image pairs efficiently
- **Detailed Reporting**: Provides breakdowns, strengths, improvements, and micro-differences

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in a `.env` file:
```env
# Required API Keys
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

# Optional Configuration
CLAUDE_BASE_URL=https://api.anthropic.com
OPENAI_BASE_URL=https://api.openai.com
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
CLAUDE_MODEL=claude-3-sonnet-20240229
OPENAI_MODEL=gpt-4-vision-preview
```

## Usage

### Basic Usage

```typescript
import { UIEvaluator } from './ui-evaluator';
import fs from 'fs/promises';

async function evaluateUI() {
    const evaluator = new UIEvaluator();
    
    // Load your images
    const sourceImageData = await fs.readFile('./source.png');
    const recreationImageData = await fs.readFile('./recreation.png');
    
    const sourceImage = {
        data: sourceImageData,
        mimeType: 'image/png',
        filename: 'source.png'
    };
    
    const recreationImage = {
        data: recreationImageData,
        mimeType: 'image/png',
        filename: 'recreation.png'
    };
    
    // Evaluate using Claude (default)
    const result = await evaluator.evaluateUI(sourceImage, recreationImage, 'claude');
    
    console.log(`Score: ${result.score}/300`);
    console.log('Breakdown:', result.breakdown);
    console.log('Strengths:', result.strengths);
    console.log('Improvements:', result.improvements);
}
```

### Batch Evaluation

```typescript
import { UIEvaluator } from './ui-evaluator';

async function batchEvaluate() {
    const evaluator = new UIEvaluator();
    
    const evaluations = [
        {
            sourceImage: sourceImage1,
            recreationImage: recreationImage1,
            name: 'Home Page'
        },
        {
            sourceImage: sourceImage2,
            recreationImage: recreationImage2,
            name: 'Settings Page'
        }
    ];
    
    const results = await evaluator.batchEvaluate(evaluations, 'claude');
    
    results.forEach(({ name, result }) => {
        console.log(`${name}: ${result.score}/300`);
    });
}
```

### Running the Main Script

The main script automatically processes image pairs from the `./images` directory:

```bash
# Use default provider (Claude)
npm start

# Specify a provider
npm start -- --provider claude
npm start -- --provider openai
npm start -- --provider gemini

# Short form
npm start -- -p claude

# Show help
npm start -- --help
```

#### Convenience Scripts

For quick access to specific providers:

```bash
npm run claude   # Use Claude
npm run openai   # Use OpenAI
npm run gemini   # Use Google Gemini
```

#### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--provider, -p` | LLM provider to use | `npm start -- -p claude` |
| `--help, -h` | Show help message | `npm start -- --help` |

Image files should be named with the pattern:
- `{index}_source_{description}.png` (original Figma design)
- `{index}_generated_{description}.png` (LLM-generated recreation)

Example:
- `0_source_home_page.png`
- `0_generated_home_page.png`
- `1_source_booking_screen.png`
- `1_generated_booking_screen.png`

## Evaluation Rubric

The evaluator uses a comprehensive 300-point rubric that evaluates:

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

### Data Variation Considerations

The evaluator is designed to distinguish between design implementation errors and legitimate differences due to mock data. **No penalties** are applied for:
- Different prices, costs, or monetary values
- Different dates, times, or temporal information
- Different names, addresses, or personal data
- Different product names or descriptions
- Different quantities, ratings, or numerical values
- Different status indicators or availability states

## API Providers

### Claude (Recommended)
- **Model**: claude-3-sonnet-20240229
- **Best for**: Detailed analysis and comprehensive feedback
- **Strengths**: Excellent at understanding design context and providing detailed breakdowns

### OpenAI GPT-4 Vision
- **Model**: gpt-4-vision-preview
- **Best for**: Quick evaluations and general feedback
- **Strengths**: Good at identifying major differences and providing concise feedback

### Google Gemini
- **Model**: gemini-pro-vision
- **Best for**: Cost-effective evaluations
- **Strengths**: Good performance for basic UI comparison tasks

## Output Format

Each evaluation returns:

```typescript
interface UIEvaluationResult {
    score: number;                    // 0-300 total score
    breakdown: {
        layout: number;               // 0-100 layout score
        visual: number;               // 0-100 visual design score
        content: number;              // 0-100 content score
    };
    strengths: string[];              // Key strengths identified
    improvements: string[];           // Areas needing improvement
    microDifferences: string[];      // Pixel-level differences detected
    dataVariations: string[];        // Data variations correctly ignored
    assessment: string;               // Overall assessment summary
    apiError?: {                     // API error information (if any)
        provider: string;            // LLM provider name
        status: number;              // HTTP status code
        message: string;             // Error message
        details?: any;               // Additional error details
    };
}
```

## Example Output

```
Score: 245/300
Breakdown:
  Layout & Structure: 82/100
  Visual Design: 78/100
  Content & Information Architecture: 85/100

Key Strengths:
  - Excellent component positioning and alignment
  - Accurate color reproduction and typography
  - Proper information hierarchy and spacing

Areas for Improvement:
  - Minor spacing inconsistencies in button groups
  - Slight color variations in secondary elements
  - Font weight differences in some text elements

Micro-Differences Detected:
  - Button spacing varies by 2px from original
  - Secondary text color differs by 5% opacity
  - Header font weight is 400 instead of 500

Data Variations Noted:
  - Different product names (correctly ignored)
  - Different pricing information (correctly ignored)
  - Different user names and addresses (correctly ignored)

Overall Assessment:
  Very good recreation with minor visual variations. The layout structure is excellent,
  and the overall design closely matches the original. Minor improvements needed in
  spacing consistency and color accuracy.
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLAUDE_API_KEY` | Yes | - | Anthropic Claude API key |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `CLAUDE_BASE_URL` | No | `https://api.anthropic.com` | Claude API base URL |
| `OPENAI_BASE_URL` | No | `https://api.openai.com` | OpenAI API base URL |
| `GEMINI_BASE_URL` | No | `https://generativelanguage.googleapis.com` | Gemini API base URL |
| `CLAUDE_MODEL` | No | `claude-3-sonnet-20240229` | Claude model to use |
| `OPENAI_MODEL` | No | `gpt-4-vision-preview` | OpenAI model to use |

### API Key Setup

1. **Claude (Anthropic)**:
   - Sign up at https://console.anthropic.com/
   - Create an API key
   - Set `CLAUDE_API_KEY` in your `.env` file

2. **OpenAI**:
   - Sign up at https://platform.openai.com/
   - Create an API key
   - Set `OPENAI_API_KEY` in your `.env` file

3. **Google Gemini**:
   - Sign up at https://makersuite.google.com/
   - Create an API key
   - Set `GEMINI_API_KEY` in your `.env` file

## Error Handling

The evaluator includes comprehensive error handling:

- **API Key Validation**: Checks for required API keys before making requests
- **Network Error Handling**: Graceful handling of network failures
- **Response Validation**: Validates API responses before parsing
- **API Error Capture**: Captures and reports detailed API error information
- **Fallback Rubric**: Uses built-in rubric if markdown file is unavailable
- **Batch Error Recovery**: Continues processing even if individual evaluations fail

### API Error Information

When API calls fail, the evaluator captures detailed error information:

```typescript
if (result.apiError) {
    console.log(`API Error: ${result.apiError.provider} (${result.apiError.status})`);
    console.log(`Message: ${result.apiError.message}`);
    console.log(`Details: ${result.apiError.details}`);
}
```

This helps with debugging API issues and understanding what went wrong with specific LLM providers.

## Performance Considerations

- **Image Size**: Large images may take longer to process and cost more
- **Batch Size**: Consider processing in smaller batches for large datasets
- **API Rate Limits**: Be aware of your chosen provider's rate limits
- **Caching**: The rubric is cached after first load for better performance

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Ensure all required API keys are set in your `.env` file
   - Check that the `.env` file is in the project root

2. **"Evaluation failed"**
   - Check your internet connection
   - Verify API keys are valid and have sufficient credits
   - Ensure images are in supported formats (PNG, JPEG)

3. **"Invalid response format"**
   - This may indicate an API change or temporary issue
   - Try using a different LLM provider
   - Check the API provider's status page
   - Check the `apiError` field in the result for detailed error information

4. **"Failed to load rubric file"**
   - Ensure `ui-evaluation-rubric.md` exists in the project root
   - The evaluator will use a fallback rubric if the file is missing

### Getting Help

- Check the console output for detailed error messages
- Verify your API keys and network connection
- Try running with a different LLM provider
- Ensure your images are properly formatted and accessible

## License

This project is licensed under the MIT License. 