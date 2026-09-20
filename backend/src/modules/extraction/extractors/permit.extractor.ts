import {
  permitNumberKeywords,
} from '../utils/keywords';
import { containsKeyword, isValidPermitNumber } from '../utils/validators';
import { formatDate, extractAfterKeyword } from '../utils/date-formatter';

export interface PermitExtractionResult {
  permitNumber: string;
  permitExpiryDate: string;
  isPermitNumberValid: boolean;
}

function findLastDate(block: string): string {
  const matches = block.match(
    /(\d{2}[-\/][A-Za-z]{3}[-\/]\d{4}|\d{2}[-\/]\d{2}[-\/]\d{4})/gi,
  );
  if (!matches) return '';
  return matches[matches.length - 1];
}

export function extractPermitData(text: string): PermitExtractionResult {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let permitNumber = '';
  let permitExpiryDate = '';

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (!permitNumber && containsKeyword(currentLine, permitNumberKeywords)) {
      permitNumber = extractAfterKeyword(lines, i, isValidPermitNumber);
    }

    const line = currentLine.toLowerCase();
    if (
      !permitExpiryDate &&
      line.includes('valid') &&
      line.includes('permit')
    ) {
      const block = lines.slice(i, i + 15).join(' ');
      permitExpiryDate = findLastDate(block);
    }
  }

  return {
    permitNumber,
    permitExpiryDate: formatDate(permitExpiryDate),
    isPermitNumberValid: isValidPermitNumber(permitNumber),
  };
}
