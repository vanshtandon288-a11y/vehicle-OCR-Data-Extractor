import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ProcessedDocument,
  DocumentType,
  ProcessingStatus,
} from '../../database/entities/document.entity';
import { ExtractedData } from '../../database/entities/extracted-data.entity';
import { OcrService } from '../ocr/ocr.service';
import { ExtractionService } from '../extraction/extraction.service';
import { UpdateExtractedDataDto } from './dto/update-document.dto';
import {
  isValidChassis,
  isValidEngine,
  isValidRegistration,
  isValidInsuranceNumber,
  isValidPUCNumber,
  isValidPermitNumber,
  isValidDate,
} from '../extraction/utils/validators';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(ProcessedDocument)
    private readonly documentRepository: Repository<ProcessedDocument>,
    @InjectRepository(ExtractedData)
    private readonly extractedDataRepository: Repository<ExtractedData>,
    private readonly ocrService: OcrService,
    private readonly extractionService: ExtractionService,
  ) {}

  async processDocumentUpload(
    file: Express.Multer.File,
    documentType: DocumentType,
    providedRawText?: string,
  ): Promise<ProcessedDocument> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(
      `Processing file upload: ${file.originalname} (Type: ${documentType})`,
    );

    // Create initial document record in database
    const document = this.documentRepository.create({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      documentType,
      status: ProcessingStatus.PROCESSING,
    });

    const savedDocument = await this.documentRepository.save(document);

    try {
      let rawText = providedRawText;
      let ocrEngineUsed = 'PaddleOCR 3.0 (PP-OCRv4 Engine)';
      let processedFilePath = file.path;

      if (!rawText) {
        const ocrResult = await this.ocrService.runOcr(file.path);
        rawText = ocrResult.rawText;
        ocrEngineUsed = ocrResult.ocrEngineUsed;
        processedFilePath = ocrResult.processedFilePath;
      }

      savedDocument.rawText = rawText || '';
      savedDocument.processedFilePath = processedFilePath;
      savedDocument.ocrEngineUsed = ocrEngineUsed;

      // Extract structured data using strategy-based extraction
      const extractedPayload = this.extractionService.extractData(
        documentType,
        savedDocument.rawText,
      );

      // Create ExtractedData entity
      const extractedData = this.extractedDataRepository.create({
        documentId: savedDocument.id,
        ...extractedPayload,
      });

      await this.extractedDataRepository.save(extractedData);

      savedDocument.status = ProcessingStatus.COMPLETED;
      savedDocument.extractedData = extractedData;
      await this.documentRepository.save(savedDocument);
      return await this.findOne(savedDocument.id);
    } catch (error) {
      this.logger.error(`Error processing document: ${error.message}`);
      savedDocument.status = ProcessingStatus.FAILED;
      savedDocument.errorMessage = error.message;
      await this.documentRepository.save(savedDocument);
      return await this.findOne(savedDocument.id);
    }
  }

  async processJsonUpload(
    base64Data: string,
    originalName: string,
    documentType: DocumentType,
    providedRawText?: string,
  ): Promise<ProcessedDocument> {
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const ext = path.extname(originalName) || '.jpg';
    const filename = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;

    const targetDir = process.env.VERCEL
      ? os.tmpdir()
      : path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
      } catch (e) {}
    }

    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, buffer);

    const document = this.documentRepository.create({
      originalName,
      fileName: filename,
      filePath,
      mimeType: ext === '.pdf' ? 'application/pdf' : 'image/jpeg',
      fileSize: buffer.length,
      documentType,
      status: ProcessingStatus.PROCESSING,
    });

    const savedDocument = await this.documentRepository.save(document);

    try {
      let rawText = providedRawText;
      let ocrEngineUsed = 'PaddleOCR 3.0 (PP-OCRv4 Engine)';
      let processedFilePath = filePath;

      if (!rawText) {
        const ocrResult = await this.ocrService.runOcr(filePath);
        rawText = ocrResult.rawText;
        ocrEngineUsed = ocrResult.ocrEngineUsed;
        processedFilePath = ocrResult.processedFilePath;
      }

      savedDocument.rawText = rawText || '';
      savedDocument.processedFilePath = processedFilePath;
      savedDocument.ocrEngineUsed = ocrEngineUsed;

      const extractedPayload = this.extractionService.extractData(
        documentType,
        savedDocument.rawText,
      );

      const extractedData = this.extractedDataRepository.create({
        documentId: savedDocument.id,
        ...extractedPayload,
      });

      await this.extractedDataRepository.save(extractedData);

      savedDocument.status = ProcessingStatus.COMPLETED;
      savedDocument.extractedData = extractedData;
      return await this.documentRepository.save(savedDocument);
    } catch (error) {
      this.logger.error(`Error processing json upload: ${error.message}`);
      savedDocument.status = ProcessingStatus.FAILED;
      savedDocument.errorMessage = error.message;
      return await this.documentRepository.save(savedDocument);
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    documentType?: DocumentType,
    search?: string,
  ): Promise<{ data: ProcessedDocument[]; total: number; page: number; totalPages: number }> {
    const query = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.extractedData', 'extractedData')
      .orderBy('document.createdAt', 'DESC');

    if (documentType) {
      query.andWhere('document.documentType = :documentType', { documentType });
    }

    if (search) {
      query.andWhere(
        '(document.originalName LIKE :search OR document.rawText LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<ProcessedDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['extractedData'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    return document;
  }

  async updateExtractedData(
    id: string,
    updateDto: UpdateExtractedDataDto,
  ): Promise<ProcessedDocument> {
    const document = await this.findOne(id);
    let extractedData = document.extractedData;

    if (!extractedData) {
      extractedData = this.extractedDataRepository.create({
        documentId: document.id,
      });
    }

    // Apply updates
    Object.assign(extractedData, updateDto);

    // Re-evaluate validation flags based on updated fields
    const validationErrors: string[] = [];

    if (document.documentType === DocumentType.RC) {
      extractedData.isChassisValid = isValidChassis(extractedData.chassisNumber);
      extractedData.isEngineValid = isValidEngine(extractedData.engineNumber);
      extractedData.isRegistrationValid = isValidRegistration(extractedData.registrationNumber);

      if (!extractedData.isChassisValid) validationErrors.push('Invalid Chassis Number');
      if (!extractedData.isEngineValid) validationErrors.push('Invalid Engine Number');
      if (!extractedData.isRegistrationValid) validationErrors.push('Invalid Registration Number');
    } else if (document.documentType === DocumentType.INSURANCE) {
      extractedData.isInsuranceNumberValid = isValidInsuranceNumber(extractedData.insuranceNumber);
      if (!extractedData.isInsuranceNumberValid) validationErrors.push('Invalid Insurance Number');
      if (!isValidDate(extractedData.insuranceExpiryDate)) validationErrors.push('Invalid Expiry Date');
    } else if (document.documentType === DocumentType.PUC) {
      extractedData.isPucNumberValid = isValidPUCNumber(extractedData.pucNumber);
      if (!extractedData.isPucNumberValid) validationErrors.push('Invalid PUC Number');
      if (!isValidDate(extractedData.pucExpiryDate)) validationErrors.push('Invalid Expiry Date');
    } else if (document.documentType === DocumentType.PERMIT) {
      extractedData.isPermitNumberValid = isValidPermitNumber(extractedData.permitNumber);
      if (!extractedData.isPermitNumberValid) validationErrors.push('Invalid Permit Number');
      if (!isValidDate(extractedData.permitExpiryDate)) validationErrors.push('Invalid Expiry Date');
    } else if (document.documentType === DocumentType.FITNESS) {
      if (!isValidDate(extractedData.fitnessExpiryDate)) validationErrors.push('Invalid Expiry Date');
    }

    extractedData.validationErrors = JSON.stringify(validationErrors);
    await this.extractedDataRepository.save(extractedData);

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const document = await this.findOne(id);

    // Delete underlying physical files safely
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        this.logger.warn(`Could not delete file: ${document.filePath}`);
      }
    }

    if (document.processedFilePath && fs.existsSync(document.processedFilePath)) {
      try {
        fs.unlinkSync(document.processedFilePath);
      } catch (err) {
        this.logger.warn(`Could not delete processed file: ${document.processedFilePath}`);
      }
    }

    await this.documentRepository.remove(document);
    return { success: true, message: `Document ${id} deleted successfully` };
  }

  async getStats(): Promise<{
    totalProcessed: number;
    successRate: number;
    byType: Record<string, number>;
    statusBreakdown: Record<string, number>;
  }> {
    const totalProcessed = await this.documentRepository.count();
    const completedCount = await this.documentRepository.count({
      where: { status: ProcessingStatus.COMPLETED },
    });
    const failedCount = await this.documentRepository.count({
      where: { status: ProcessingStatus.FAILED },
    });

    const byType: Record<string, number> = {};
    for (const type of Object.values(DocumentType)) {
      byType[type] = await this.documentRepository.count({
        where: { documentType: type },
      });
    }

    return {
      totalProcessed,
      successRate: totalProcessed > 0 ? Math.round((completedCount / totalProcessed) * 100) : 100,
      byType,
      statusBreakdown: {
        completed: completedCount,
        failed: failedCount,
        processing: totalProcessed - completedCount - failedCount,
      },
    };
  }
}
