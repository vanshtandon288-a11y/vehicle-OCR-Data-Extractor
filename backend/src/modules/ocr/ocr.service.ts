import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

import * as os from 'os';

export interface OcrResult {
  rawText: string;
  processedFilePath: string;
  ocrEngineUsed: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async preprocessImage(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    // Ensure processed directory exists in writable location (/tmp on Vercel)
    const processedDir = process.env.VERCEL
      ? os.tmpdir()
      : path.join(process.cwd(), 'processed');

    if (!fs.existsSync(processedDir)) {
      try {
        fs.mkdirSync(processedDir, { recursive: true });
      } catch (e) {}
    }

    if (['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext)) {
      const resizedPath = path.join(
        processedDir,
        `processed_${Date.now()}_${path.basename(filePath, ext)}.jpg`,
      );

      await sharp(filePath)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(resizedPath);

      return resizedPath;
    }

    // For PDF or other files, return original
    return filePath;
  }

  async runOcr(filePath: string): Promise<OcrResult> {
    const processedFilePath = await this.preprocessImage(filePath);

    // Bypasses 30-second Python process spawn timeout on Vercel Serverless
    const isVercel = !!process.env.VERCEL;

    if (!isVercel && process.env.PADDLEOCR_ENABLED !== 'false') {
      try {
        const paddleText = await this.runPaddleOcr(processedFilePath);
        if (paddleText && paddleText.length > 5 && !paddleText.includes('error')) {
          this.logger.log('PaddleOCR processed document successfully');
          return {
            rawText: paddleText,
            processedFilePath,
            ocrEngineUsed: 'PaddleOCR 3.0',
          };
        }
      } catch (err) {
        this.logger.warn(`PaddleOCR worker warning: ${err.message}. Falling back to Tesseract.js`);
      }
    }

    // Fast Tesseract.js execution
    this.logger.log('Running Tesseract.js OCR engine...');
    const tesseractText = await this.runTesseractOcr(processedFilePath);
    return {
      rawText: tesseractText,
      processedFilePath,
      ocrEngineUsed: 'Tesseract.js 5.0',
    };
  }

  private runPaddleOcr(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonPath = process.env.PYTHON_PATH || 'python';
      const scriptPath = path.join(process.cwd(), 'python_ocr', 'ocr.py');

      if (!fs.existsSync(scriptPath)) {
        return reject(new Error(`Script not found: ${scriptPath}`));
      }

      const pyProcess = spawn(pythonPath, [scriptPath]);
      let output = '';
      let errorOutput = '';

      const timeout = setTimeout(() => {
        pyProcess.kill();
        reject(new Error('PaddleOCR process timed out after 30 seconds'));
      }, 30000);

      pyProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('END_RESULT')) {
          clearTimeout(timeout);
          pyProcess.kill();
          try {
            const clean = output.replace('END_RESULT', '').trim();
            const parsed = JSON.parse(clean);
            if (Array.isArray(parsed)) {
              resolve(parsed.join('\n'));
            } else if (parsed && parsed.error) {
              reject(new Error(parsed.error));
            } else {
              resolve(clean);
            }
          } catch (e) {
            resolve(output.replace('END_RESULT', '').trim());
          }
        }
      });

      pyProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pyProcess.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      pyProcess.on('exit', (code) => {
        clearTimeout(timeout);
        if (code !== 0 && !output) {
          reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
        }
      });

      // Send image path to stdin
      pyProcess.stdin.write(imagePath + '\n');
    });
  }

  private async runTesseractOcr(imagePath: string): Promise<string> {
    try {
      const worker = await createWorker('eng', 1, {
        cachePath: os.tmpdir(),
        cacheMethod: 'write',
      });
      const ret = await worker.recognize(imagePath);
      await worker.terminate();
      return ret.data.text || '';
    } catch (error) {
      this.logger.error(`Tesseract OCR failed: ${error.message}`);
      return '';
    }
  }
}
