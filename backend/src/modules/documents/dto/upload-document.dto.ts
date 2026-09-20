import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '../../../database/entities/document.entity';

export class UploadDocumentDto {
  @IsNotEmpty({ message: 'documentType is required' })
  @IsEnum(DocumentType, {
    message: 'documentType must be one of: rc, insurance, puc, permit, fitness',
  })
  documentType: DocumentType;
}
