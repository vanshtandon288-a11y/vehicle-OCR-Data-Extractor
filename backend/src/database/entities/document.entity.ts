import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ExtractedData } from './extracted-data.entity';

export enum DocumentType {
  RC = 'rc',
  INSURANCE = 'insurance',
  PUC = 'puc',
  PERMIT = 'permit',
  FITNESS = 'fitness',
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('processed_documents')
export class ProcessedDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  processedFilePath: string;

  @Column()
  mimeType: string;

  @Column('int')
  fileSize: number;

  @Column({
    type: 'varchar',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({
    type: 'varchar',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  status: ProcessingStatus;

  @Column({ type: 'text', nullable: true })
  rawText: string;

  @Column({ nullable: true })
  ocrEngineUsed: string;

  @Column({ nullable: true })
  errorMessage: string;

  @OneToOne(() => ExtractedData, (extractedData) => extractedData.document, {
    cascade: true,
    eager: true,
  })
  extractedData: ExtractedData;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
