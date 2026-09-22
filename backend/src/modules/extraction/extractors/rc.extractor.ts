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
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        const lineTextNoDate = lines[j].replace(/\d{2}[\-\/\.]\d{2}[\-\/\.]\d{4}|\d{2}[\-\/\.][A-Za-z]{3}[\-\/\.]\d{4}/gi, '');
        const regMatches = lineTextNoDate.match(/([A-Z]{2}[\s\-\.]*\d{1,2}[\s\-\.]*[A-Z]{0,3}[\s\-\.]*\d{1,4})|(\d{2}[\s\-\.]*BH[\s\-\.]*\d{4}[\s\-\.]*[A-Z]{1,2})/gi);
        if (regMatches) {
          for (const m of regMatches) {
            const val = cleanValue(m);
            if (isValidRegistration(val) && val !== chassisNumber && val !== engineNumber) {
              registrationNumber = val;
              break;
            }
          }
        }
        if (registrationNumber) break;
      }
    }
  }

  // Fallback 1: Scan across entire text for valid registration pattern
  if (!registrationNumber) {
    const textNoDate = text.replace(/\d{2}[\-\/\.]\d{2}[\-\/\.]\d{4}|\d{2}[\-\/\.][A-Za-z]{3}[\-\/\.]\d{4}/gi, '');
    const regMatches = textNoDate.match(/([A-Z]{2}[\s\-\.]*\d{1,2}[\s\-\.]*[A-Z]{0,3}[\s\-\.]*\d{1,4})|(\d{2}[\s\-\.]*BH[\s\-\.]*\d{4}[\s\-\.]*[A-Z]{1,2})/gi);
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

  // Fallback 2: Indian State Codes + District + Series + Number (DL, MH, HR, UP, KA, GJ, TN, RJ, WB, AP, TS, KL, PB, CH, OD, BR, JH, MP, CG, UK, HP, JK)
  if (!registrationNumber) {
    const stateCodesRegex = /(DL|MH|HR|UP|KA|GJ|TN|RJ|WB|AP|TS|KL|PB|CH|OD|BR|JH|MP|CG|UK|HP|JK)[\s\-\.]*(\d{1,2}|O\d|O[0-9])[\s\-\.]*([A-Z]{1,3})[\s\-\.]*(\d{1,4})/gi;
    const stateMatch = stateCodesRegex.exec(text);
    if (stateMatch) {
      const state = stateMatch[1].toUpperCase();
      let dist = stateMatch[2].toUpperCase().replace('O', '0');
      const series = stateMatch[3].toUpperCase();
      const num = stateMatch[4];
      const constructed = `${state}${dist}${series}${num}`;
      if (isValidRegistration(constructed)) {
        registrationNumber = constructed;
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
