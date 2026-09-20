import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ProcessedDocument } from '../../database/entities/document.entity';
import { ExtractedData } from '../../database/entities/extracted-data.entity';
import { OcrService } from '../ocr/ocr.service';
import { ExtractionService } from '../extraction/extraction.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessedDocument, ExtractedData])],
  controllers: [DocumentsController],
  providers: [DocumentsService, OcrService, ExtractionService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
