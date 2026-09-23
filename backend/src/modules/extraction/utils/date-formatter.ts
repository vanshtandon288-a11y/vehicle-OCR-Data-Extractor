import { isValidRegistration } from './validators';

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const months: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
    Uec: '12',
    JAN: '01',
    FEB: '02',
    MAR: '03',
    APR: '04',
    MAY: '05',
    JUN: '06',
    JUL: '07',
    AUG: '08',
    SEP: '09',
    sept: '09',
    SEPT: '09',
    OCT: '10',
    NOV: '11',
    DEC: '12',
  };

  const slashMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (slashMatch) {
    return `${slashMatch[3]}/${slashMatch[2]}/${slashMatch[1]}`;
  }

  const match = dateStr.match(/(\d{2})-([A-Za-z]{3})-(\d{4})/);
  if (!match) return dateStr;

  const day = match[1];
  const month = months[match[2]];
  const year = match[3];
  return `${year}/${month}/${day}`;
}

export function extractAfterKeyword(
  lines: string[],
  startIndex: number,
  validator: (val: string) => boolean,
): string {
  let fallbackCandidate = '';

  for (
    let j = startIndex;
    j <= startIndex + 5 && j < lines.length;
    j++
  ) {
    const line = lines[j].toUpperCase();
    const matches = line.match(/([A-Z0-9\-\/]{6,35})/g) || line.match(/([A-Z0-9]{6,35})/g);
    if (!matches) continue;
    for (const match of matches) {
      const value = cleanValue(match);
      if (
        value.includes('ENGINE') ||
        value.includes('MOTOR') ||
        value.includes('CHASSIS') ||
        value.includes('NUMBER') ||
        value.includes('OWNER') ||
        value.includes('ADDRESS') ||
        /^\d{6,8}$/.test(value) ||
        isValidRegistration(value)
      ) {
        continue;
      }
      if (validator(value)) {
        return value;
      }
      if (!fallbackCandidate && value.length >= 6 && /\d/.test(value) && /[A-Z]/.test(value)) {
        fallbackCandidate = value;
      }
    }
  }
  return fallbackCandidate;
}

function cleanValue(val: string): string {
  return val.replace(/[^A-Z0-9]/gi, '').toUpperCase().trim();
}
