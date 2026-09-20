import { fitnessExpiryKeywords } from '../utils/keywords';
import { containsKeyword } from '../utils/validators';
import { formatDate } from '../utils/date-formatter';

export interface FitnessExtractionResult {
  fitnessExpiryDate: string;
}

export function extractFitnessData(text: string): FitnessExtractionResult {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let fitnessExpiryDate = '';

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (
      !fitnessExpiryDate &&
      containsKeyword(currentLine, fitnessExpiryKeywords)
    ) {
      const block = lines.slice(i, i + 8).join(' ');
      let searchText = block;
      if (block.toLowerCase().includes('fitness')) {
        const index = block
          .toLowerCase()
          .search(/fitness\s*valid\s*upto/);
        if (index !== -1) {
          searchText = block.substring(index);
        }
      }

      const match = searchText.match(/(\d{2}[-\/][A-Za-z]{3}[-\/]\d{4})/);
      if (match) {
        fitnessExpiryDate = match[0];
      }
    }
  }

  return {
    fitnessExpiryDate: formatDate(fitnessExpiryDate),
  };
}
