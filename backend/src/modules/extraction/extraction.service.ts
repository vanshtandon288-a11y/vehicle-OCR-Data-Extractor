import { Injectable, Logger } from '@nestjs/common';
import { DocumentType } from '../../database/entities/document.entity';
import { extractRCData } from './extractors/rc.extractor';
import { extractInsuranceData } from './extractors/insurance.extractor';
import { extractPUCData } from './extractors/puc.extractor';
import { extractPermitData } from './extractors/permit.extractor';
import { extractFitnessData } from './extractors/fitness.extractor';
import { isValidDate } from './utils/validators';

export interface ExtractedFieldsPayload {
  chassisNumber?: string;
  engineNumber?: string;
  registrationNumber?: string;
  insuranceNumber?: string;
  insuranceExpiryDate?: string;
  pucNumber?: string;
  pucExpiryDate?: string;
  permitNumber?: string;
  permitExpiryDate?: string;
  fitnessExpiryDate?: string;
  isChassisValid?: boolean;
  isEngineValid?: boolean;
  isRegistrationValid?: boolean;
  isInsuranceNumberValid?: boolean;
  isPucNumberValid?: boolean;
  isPermitNumberValid?: boolean;
  validationErrors?: string;
}

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  extractData(
    documentType: DocumentType,
    rawText: string,
  ): ExtractedFieldsPayload {
    this.logger.log(`Extracting fields for document type: ${documentType}`);

    const payload: ExtractedFieldsPayload = {};
    const validationErrors: string[] = [];

    switch (documentType) {
      case DocumentType.RC: {
        const rc = extractRCData(rawText);
        payload.chassisNumber = rc.chassisNumber;
        payload.engineNumber = rc.engineNumber;
        payload.registrationNumber = rc.registrationNumber;
        payload.isChassisValid = rc.isChassisValid;
        payload.isEngineValid = rc.isEngineValid;
        payload.isRegistrationValid = rc.isRegistrationValid;

        if (!rc.chassisNumber) validationErrors.push('Chassis number missing');
        else if (!rc.isChassisValid) validationErrors.push('Invalid Chassis number format');

        if (!rc.engineNumber) validationErrors.push('Engine number missing');
        else if (!rc.isEngineValid) validationErrors.push('Invalid Engine number format');

        if (!rc.registrationNumber) validationErrors.push('Registration number missing');
        else if (!rc.isRegistrationValid) validationErrors.push('Invalid Registration number format');
        break;
      }

      case DocumentType.INSURANCE: {
        const ins = extractInsuranceData(rawText);
        payload.insuranceNumber = ins.insuranceNumber;
        payload.insuranceExpiryDate = ins.insuranceExpiryDate;
        payload.isInsuranceNumberValid = ins.isInsuranceNumberValid;

        if (!ins.insuranceNumber) validationErrors.push('Insurance Policy number missing');
        else if (!ins.isInsuranceNumberValid) validationErrors.push('Invalid Insurance Policy number format');

        if (!ins.insuranceExpiryDate) validationErrors.push('Insurance Expiry Date missing');
        else if (!isValidDate(ins.insuranceExpiryDate)) validationErrors.push('Invalid Insurance Expiry Date format');
        break;
      }

      case DocumentType.PUC: {
        const puc = extractPUCData(rawText);
        payload.pucNumber = puc.pucNumber;
        payload.pucExpiryDate = puc.pucExpiryDate;
        payload.isPucNumberValid = puc.isPucNumberValid;

        if (!puc.pucNumber) validationErrors.push('PUC Certificate number missing');
        else if (!puc.isPucNumberValid) validationErrors.push('Invalid PUC Certificate number format');

        if (!puc.pucExpiryDate) validationErrors.push('PUC Expiry Date missing');
        else if (!isValidDate(puc.pucExpiryDate)) validationErrors.push('Invalid PUC Expiry Date format');
        break;
      }

      case DocumentType.PERMIT: {
        const per = extractPermitData(rawText);
        payload.permitNumber = per.permitNumber;
        payload.permitExpiryDate = per.permitExpiryDate;
        payload.isPermitNumberValid = per.isPermitNumberValid;

        if (!per.permitNumber) validationErrors.push('Permit number missing');
        else if (!per.isPermitNumberValid) validationErrors.push('Invalid Permit number format');

        if (!per.permitExpiryDate) validationErrors.push('Permit Expiry Date missing');
        else if (!isValidDate(per.permitExpiryDate)) validationErrors.push('Invalid Permit Expiry Date format');
        break;
      }

      case DocumentType.FITNESS: {
        const fit = extractFitnessData(rawText);
        payload.fitnessExpiryDate = fit.fitnessExpiryDate;

        if (!fit.fitnessExpiryDate) validationErrors.push('Fitness Expiry Date missing');
        else if (!isValidDate(fit.fitnessExpiryDate)) validationErrors.push('Invalid Fitness Expiry Date format');
        break;
      }
    }

    payload.validationErrors = JSON.stringify(validationErrors);
    return payload;
  }
}
