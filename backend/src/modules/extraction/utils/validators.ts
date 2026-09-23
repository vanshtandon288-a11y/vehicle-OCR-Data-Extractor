export function cleanValue(value: string): string {
  if (!value) return '';
  return value
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .trim();
}

export function containsKeyword(line: string, keywords: string[]): boolean {
  if (!line || !keywords) return false;
  const lowerLine = line.toLowerCase();
  return keywords.some((keyword) =>
    lowerLine.includes(keyword.toLowerCase()),
  );
}

export function isValidChassis(value: string): boolean {
  const cleaned = cleanValue(value);
  return (
    cleaned.length >= 15 &&
    cleaned.length <= 20 &&
    /[A-Z]/.test(cleaned) &&
    /\d/.test(cleaned)
  );
}

export function isValidEngine(value: string): boolean {
  const cleaned = cleanValue(value);
  if (isValidRegistration(cleaned)) {
    return false;
  }
  // Engine number should NOT be pure 6 or 8-digit date string (e.g. 20042026 from 20-04-2026)
  if (/^\d{6,8}$/.test(cleaned)) {
    return false;
  }
  // Reject strings starting with 17-char full VIN chassis prefixes (e.g. MBLMC, MA1, MB1) but keep engine codes (e.g. MC38E)
  const chassisPrefixes = ['MBLMC', 'MA1WB', 'MB1WB'];
  if (chassisPrefixes.some((prefix) => cleaned.startsWith(prefix))) {
    return false;
  }
  return (
    cleaned.length >= 8 &&
    cleaned.length <= 25 &&
    /\d/.test(cleaned) &&
    !cleaned.includes('NUMBER') &&
    !cleaned.includes('ENGINE') &&
    !cleaned.includes('MOTOR') &&
    !cleaned.includes('VALID') &&
    !cleaned.includes('REGN')
  );
}

export function isValidRegistration(value: string): boolean {
  const cleaned = cleanValue(value);

  // Standard Indian State vehicle registration: e.g. DL6SAG2552, MH12AB1234, DL01A1234
  const standardPattern = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/;

  // BH (Bharat) series registration: e.g. 21BH1234AA, 22BH5678A
  const bhPattern = /^\d{2}BH\d{4}[A-Z]{1,2}$/;

  // Commercial / State variations: e.g. DL1C1234, MH121234
  const flexPattern = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/;

  return (
    (standardPattern.test(cleaned) || bhPattern.test(cleaned) || flexPattern.test(cleaned)) &&
    cleaned.length >= 6 &&
    cleaned.length <= 13 &&
    !cleaned.includes('CHASSIS') &&
    !cleaned.includes('ENGINE') &&
    !cleaned.includes('MODEL')
  );
}

export function isValidInsuranceNumber(value: string): boolean {
  const cleaned = cleanValue(value);
  return (
    cleaned.length >= 6 &&
    !cleaned.includes('POLICY') &&
    !cleaned.includes('NUMBER')
  );
}

export function isValidPUCNumber(value: string): boolean {
  const cleaned = cleanValue(value);
  return cleaned.length >= 6 && cleaned.length <= 30 && /\d/.test(cleaned);
}

export function isValidPermitNumber(value: string): boolean {
  const cleaned = cleanValue(value);
  return /^[A-Z]{2}\d{4}[A-Z]{2}\d{4}$/.test(cleaned) || (cleaned.length >= 6 && /\d/.test(cleaned));
}

export function isValidDate(value: string): boolean {
  if (!value) return false;
  const cleaned = cleanValue(value);
  return (
    /\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(cleaned) ||
    /\d{2}[A-Za-z]{3}\d{4}/.test(cleaned)
  );
}
