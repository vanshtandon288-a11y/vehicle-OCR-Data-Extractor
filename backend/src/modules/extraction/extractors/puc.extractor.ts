import { pucNumberKeywords, pucExpiryKeywords } from '../utils/keywords';
import { containsKeyword, isValidPUCNumber } from '../utils/validators';
import { formatDate, extractAfterKeyword } from '../utils/date-formatter';

export interface PUCExtractionResult {
  pucNumber: string;
  pucExpiryDate: string;
  isPucNumberValid: boolean;
}

export function extractPUCData(text: string): PUCExtractionResult {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let pucNumber = '';
  let pucExpiryDate = '';

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (!pucNumber && containsKeyword(currentLine, pucNumberKeywords)) {
      pucNumber = extractAfterKeyword(lines, i, isValidPUCNumber);
    }

    if (!pucExpiryDate && containsKeyword(currentLine, pucExpiryKeywords)) {
      const block = lines.slice(i, i + 5).join(' ');
      const match = block.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        pucExpiryDate = match[0];
      }
    }
  }

  return {
    pucNumber,
    pucExpiryDate: formatDate(pucExpiryDate),
    isPucNumberValid: isValidPUCNumber(pucNumber),
  };
}
