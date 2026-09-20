import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProcessedDocument } from './document.entity';

@Entity('extracted_data')
export class ExtractedData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @OneToOne(() => ProcessedDocument, (document) => document.extractedData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: ProcessedDocument;

  @Column({ nullable: true })
  chassisNumber: string;

  @Column({ nullable: true })
  engineNumber: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  insuranceNumber: string;

  @Column({ nullable: true })
  insuranceExpiryDate: string;

  @Column({ nullable: true })
  pucNumber: string;

  @Column({ nullable: true })
  pucExpiryDate: string;

  @Column({ nullable: true })
  permitNumber: string;

  @Column({ nullable: true })
  permitExpiryDate: string;

  @Column({ nullable: true })
  fitnessExpiryDate: string;

  @Column({ type: 'boolean', nullable: true })
  isChassisValid: boolean;

  @Column({ type: 'boolean', nullable: true })
  isEngineValid: boolean;

  @Column({ type: 'boolean', nullable: true })
  isRegistrationValid: boolean;

  @Column({ type: 'boolean', nullable: true })
  isInsuranceNumberValid: boolean;

  @Column({ type: 'boolean', nullable: true })
  isPucNumberValid: boolean;

  @Column({ type: 'boolean', nullable: true })
  isPermitNumberValid: boolean;

  @Column({ type: 'text', nullable: true })
  validationErrors: string; // JSON string of validation errors

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
