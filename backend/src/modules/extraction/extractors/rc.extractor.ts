import {
  chassisKeywords,
  engineKeywords,
  registrationKeywords,
} from '../utils/keywords';
import {
  cleanValue,
  containsKeyword,
  isValidChassis,
  isValidEngine,
  isValidRegistration,
} from '../utils/validators';
import { extractAfterKeyword } from '../utils/date-formatter';

export interface RCExtractionResult {
  chassisNumber: string;
  engineNumber: string;
  registrationNumber: string;
  isChassisValid: boolean;
  isEngineValid: boolean;
  isRegistrationValid: boolean;
}

export function extractRCData(text: string): RCExtractionResult {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let chassisNumber = '';
  let engineNumber = '';
  let registrationNumber = '';

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (!chassisNumber && containsKeyword(currentLine, chassisKeywords)) {
      chassisNumber = extractAfterKeyword(lines, i, isValidChassis);
    }

    if (!engineNumber && containsKeyword(currentLine, engineKeywords)) {
      const samelineMatches = currentLine
        .toUpperCase()
        .match(/([A-Z0-9]{6,25})/g);
      if (samelineMatches) {
        for (const match of samelineMatches) {
          const value = cleanValue(match);
          if (
            isValidEngine(value) &&
            value !== chassisNumber &&
            !value.includes('ENGINE') &&
            !value.includes('MOTOR')
          ) {
            engineNumber = value;
            break;
          }
        }
      }
      if (!engineNumber) {
        engineNumber = extractAfterKeyword(lines, i, isValidEngine);
      }
    }

    if (
      !registrationNumber &&
      containsKeyword(currentLine, registrationKeywords)
    ) {
      const samelinereg = currentLine.match(
        /([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4})/i,
      );
      if (samelinereg) {
        registrationNumber = samelinereg[0];
      }
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        const regMatch = lines[j].match(
          /([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4})/i,
        );
        if (regMatch) {
          registrationNumber = regMatch[0];
          break;
        }
      }
    }
  }

  // Fallback scan if registration number is not found by keywords
  if (!registrationNumber) {
    const regMatches = text.match(/([A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4})/gi);
    if (regMatches) {
      for (const m of regMatches) {
        const val = cleanValue(m);
        if (isValidRegistration(val) && val !== chassisNumber && val !== engineNumber) {
          registrationNumber = val;
          break;
        }
      }
    }
  }

  if (!chassisNumber) {
    const allMatches = text.match(/([A-Z0-9]{15,20})/gi);
    if (allMatches) {
      for (const match of allMatches) {
        const value = cleanValue(match);
        if (isValidChassis(value)) {
          chassisNumber = value;
          break;
        }
      }
    }
  }

  if (!engineNumber) {
    const allMatches = text.match(/([A-Z0-9]{8,25})/gi);
    if (allMatches) {
      for (const match of allMatches) {
        const value = cleanValue(match);
        if (
          isValidEngine(value) &&
          value !== chassisNumber &&
          value !== cleanValue(registrationNumber)
        ) {
          engineNumber = value;
          break;
        }
      }
    }
  }

  if (engineNumber === chassisNumber) {
    engineNumber = '';
  }

  const cleanedReg = cleanValue(registrationNumber);

  return {
    chassisNumber,
    engineNumber,
    registrationNumber: cleanedReg,
    isChassisValid: isValidChassis(chassisNumber),
    isEngineValid: isValidEngine(engineNumber),
    isRegistrationValid: isValidRegistration(cleanedReg),
  };
}
