import {
  insuranceNumberKeywords,
  insuranceExpiryKeywords,
} from '../utils/keywords';
import {
  containsKeyword,
  isValidInsuranceNumber,
} from '../utils/validators';
import { formatDate, extractAfterKeyword } from '../utils/date-formatter';

export interface InsuranceExtractionResult {
  insuranceNumber: string;
  insuranceExpiryDate: string;
  isInsuranceNumberValid: boolean;
}

export function extractInsuranceData(text: string): InsuranceExtractionResult {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let insuranceNumber = '';
  let insuranceExpiryDate = '';

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (
      !insuranceNumber &&
      containsKeyword(currentLine, insuranceNumberKeywords)
    ) {
      insuranceNumber = extractAfterKeyword(
        lines,
        i,
        isValidInsuranceNumber,
      );
    }

    if (
      !insuranceExpiryDate &&
      containsKeyword(currentLine, insuranceExpiryKeywords)
    ) {
      const block = lines.slice(i, i + 15).join(' ');
      const dates = block.match(/(\d{2})[-/][A-Z]{3}[-/]\d{4}/gi);
      if (dates && dates.length >= 2) {
        insuranceExpiryDate = dates[1];
      } else if (dates && dates.length === 1) {
        insuranceExpiryDate = dates[0];
      }
    }
  }

  return {
    insuranceNumber,
    insuranceExpiryDate: formatDate(insuranceExpiryDate),
    isInsuranceNumberValid: isValidInsuranceNumber(insuranceNumber),
  };
}
