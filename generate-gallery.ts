import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

interface ComparisonPair {
  id: number;
  sourceImage: string;
  generatedImage: string;
  report?: string;
}

interface ReportInfo {
    provider: string;
    timestamp: string;
}

async function getFilePaths(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilePaths(res) : [res];
    })
  );
  return Array.prototype.concat(...files);
}

async function findImagePairs(): Promise<ComparisonPair[]> {
  const imageFiles = await getFilePaths('images');
  const pairs: Map<number, Partial<ComparisonPair>> = new Map();

  const addOrUpdatePair = (id: number, data: Partial<ComparisonPair>) => {
    if (!pairs.has(id)) {
      pairs.set(id, { id });
    }
    pairs.set(id, { ...pairs.get(id), ...data });
  };

  for (const file of imageFiles) {
    const basename = path.basename(file);
    const match = basename.match(/^(\d+)_(source|generated)_.+\.png$/);
    if (match) {
      const id = parseInt(match[1], 10);
      const type = match[2];
      if (type === 'source') {
        addOrUpdatePair(id, { sourceImage: file });
      } else if (type === 'generated') {
        addOrUpdatePair(id, { generatedImage: file });
      }
    }
  }

  return [...pairs.values()].filter(
    p => p.sourceImage && p.generatedImage
  ) as ComparisonPair[];
}

function parseReport(reportContent: string): Map<number, string> {
    const pairReports = new Map<number, string>();
    const sections = reportContent.split('## ').slice(1);

    for (const section of sections) {
        const match = section.match(/^Pair (\d+):/);
        if (match) {
            const id = parseInt(match[1], 10);
            pairReports.set(id, '## ' + section);
        }
    }
    return pairReports;
}


async function generateGallery(pairs: ComparisonPair[], reportInfo: ReportInfo): Promise<string> {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UI Comparison Gallery - ${reportInfo.provider} - ${reportInfo.timestamp}</title>
        <style>
          body { font-family: sans-serif; margin: 2em; }
          .comparison-container {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 2fr;
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
            max-width: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <h1>UI Comparison Gallery</h1>
        <h2>Provider: ${reportInfo.provider}</h2>
        <h3>Timestamp: ${reportInfo.timestamp}</h3>
    `;
  
    for (const pair of pairs) {
      if (pair.report) {
        const reportHtml = marked(pair.report);
        const sourceImageRelative = path.relative('gallery_output', pair.sourceImage);
        const generatedImageRelative = path.relative('gallery_output', pair.generatedImage);
    
        html += `
          <div class="comparison-container">
            <div class="image-container">
              <h3>Generated (Pair ${pair.id})</h3>
              <img src="${generatedImageRelative}" alt="Generated Image ${pair.id}">
            </div>
            <div class="image-container">
              <h3>Source (Pair ${pair.id})</h3>
              <img src="${sourceImageRelative}" alt="Source Image ${pair.id}">
            </div>
            <div class="report-container">
              ${reportHtml}
            </div>
          </div>
        `;
      }
    }
  
    html += `
      </body>
      </html>
    `;
  
    return html;
  }
  
async function main() {
    const reportPath = process.argv[2];
    if (!reportPath) {
        console.error('Error: Please provide the path to the markdown report file.');
        process.exit(1);
    }

    try {
        const reportContent = await fs.readFile(reportPath, 'utf-8');
        const basename = path.basename(reportPath);
        const match = basename.match(/^report-(claude|gemini|openai)-(.+)\.md$/);

        if (!match) {
            console.error('Error: Invalid report filename format. Expected: report-<provider>-<timestamp>.md');
            process.exit(1);
        }

        const [, provider, timestamp] = match;
        const reportInfo: ReportInfo = { provider, timestamp };

        const pairReports = parseReport(reportContent);
        const pairs = await findImagePairs();

        pairs.forEach(pair => {
            if (pairReports.has(pair.id)) {
                pair.report = pairReports.get(pair.id);
            }
        });

        const galleryHtml = await generateGallery(pairs, reportInfo);
        
        const outputDir = 'gallery_output';
        await fs.mkdir(outputDir, { recursive: true });

        const outputFilename = `gallery-${provider}-${timestamp}.html`;
        const outputPath = path.join(outputDir, outputFilename);
        await fs.writeFile(outputPath, galleryHtml);
        
        console.log(`Gallery generated successfully: ${outputPath}`);

    } catch (error) {
        console.error('Error generating gallery:', error);
        process.exit(1);
    }
}

main().catch(console.error);
