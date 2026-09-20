const sharp = require("sharp");
const path = require("path");

const chassisKeywords = [
  "chassis",
  "chasis",
  "vin",
  "chassls"
];

const engineKeywords = [
  "engine",
  "engine no",
  "engine number",
  "eng no",
  "motor no",
  "motor number",
  "englnu",
  "englnuvetorno"
];

const registrationKeywords = [
  "regn",
  "registration",
  "registration number",
  "regn. number",
  "reg no",
  "rogn",
  "rego",
  "reg",
  "regnno",
  "rooono"
];

const insuranceNumberKeywords = [
  "POLICY NO",
  "POLICY NO.",
  "POLICY NUMBER",
  "POLICY CERTIFICATE NO",
  "CERTIFICATE NO",
  "POLIEY NO"
];

const InsuranceExpiryKeywords = [
  "EXPIRY DATE",
  "VALID UPTO",
  "VALID UP TO",
  "VALID TILL",
  "VALIDITY",
  "END DATE",
  "POLICY EXPIRY",
  "PERIOD OF OWN DAMAGE",
  "PERFOD OF INSURANCE",
  "PERIOD OF INSURANCE"
];

const pucNumberKeywords = [
  "PUC NO",
  "PUC NUMBER",
  "CERTIFICATE NO",
  "CERTIFICATE NUMBER",
  "CERTIFICATE",
  "CERTIFICATE SL NO.",
  "CERUTCANE SLNs",
  "CERTIFICATEO SL. NO."
];

const pucExpiryKeywords = [
  "VALID UPTO",
  "VALID UP TO",
  "VALID TILL",
  "VALIDITY",
  "EXPIRY DATE",
  "EXPIRY",
  "VALIDITY UPTO",
  "Valdy ugto"
];

const permitNumberKeywords = [
  "PERMIT NO",
  "PERMIT NUMBER",
  "PERMIT",
  "CERTIFICATE NO",
  "CERTIFICATE NUMBER",
  "CERTIFCATE",
  "Perrntl No"
];

const permitExpiryKeywords = [
  "VALIDITY OF PERMIT",
  "VALID UPTO",
  "//TO",
  "VALID UP TO",
  "VALID TILL",
  "VALIDITY",
  "EXPIRY DATE",
  "EXPIRY"
];

const fitnessExpiryKeywords = [
  "CERTIFICATE WILL EXPIRE",
  "FITNESS VALID UPTO",
  "FITNESS VALID UP TO",
  "CERTIFICATE WILL EXPIRE ON",
  "EXPIRE ON",
  "FITNESS VALID UPTO",
  "VALID UPTO",
  "VALID TILL"
];

function formatDate(date) {
  if (!date) return "";
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    Uec: "12", JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05",
    JUN: "06", JUL: "07", AUG: "08", SEP: "09", sept: "09", SEPT: "09",
    OCT: "10", NOV: "11", DEC: "12"
  };
  const slashMatch = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (slashMatch) {
    return `${slashMatch[3]}/${slashMatch[2]}/${slashMatch[1]}`;
  }
  const match = date.match(/(\d{2})-([A-Za-z]{3})-(\d{4})/);
  if (!match) return date;
  const day = match[1];
  const month = months[match[2]];
  const year = match[3];
  return `${year}/${month}/${day}`;
}

function cleanValue(value) {
  if (!value) return "";
  return value
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .trim();
}

function containsKeyword(line, keywords) {
  const lowerLine = line.toLowerCase();
  return keywords.some((keyword) =>
    lowerLine.includes(keyword.toLowerCase())
  );
}

function isValidChassis(value) {
  value = cleanValue(value);
  return (
    value.length >= 15 &&
    value.length <= 20 &&
    /[A-Z]/.test(value) &&
    /\d/.test(value)
  );
}

function isValidEngine(value) {
  value = cleanValue(value);
  // Engine number should NOT match vehicle registration code format (State code + numbers + letters + digits)
  const regNumberPattern = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d+/;
  if (regNumberPattern.test(value)) {
    return false;
  }
  // Engine number should NOT be pure 6 or 8-digit date string (e.g. 20042026 from 20-04-2026)
  if (/^\d{6,8}$/.test(value)) {
    return false;
  }
  return (
    value.length >= 8 &&
    value.length <= 25 &&
    /\d/.test(value) &&
    !value.includes("NUMBER") &&
    !value.includes("ENGINE") &&
    !value.includes("MOTOR") &&
    !value.includes("VALID") &&
    !value.includes("REGN")
  );
}

function isValidRegistration(value) {
  value = cleanValue(value);
  return /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/.test(value);
}

function isValidInsuranceNumber(value) {
  value = cleanValue(value);
  return (
    value.length >= 6 &&
    !value.includes("POLICY") &&
    !value.includes("NUMBER")
  );
}

function isValidPUCNumber(value) {
  value = cleanValue(value);
  return (
    value.length >= 6 &&
    value.length <= 30 &&
    /\d/.test(value)
  );
}

function isValidPermitNumber(value) {
  value = cleanValue(value);
  return /^[A-Z]{2}\d{4}[A-Z]{2}\d{4}$/.test(value) || (value.length >= 6 && /\d/.test(value));
}

function isValidDate(value) {
  if (!value) return false;
  value = cleanValue(value);
  return (
    /\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(value) ||
    /\d{2}[A-Za-z]{3}\d{4}/.test(value)
  );
}

function extractAfterKeyword(lines, startIndex, validator) {
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
      console.log("checking", value);
      console.log("Validator", validator(value));
      if (
        value.includes("ENGINE") ||
        value.includes("MOTOR") ||
        value.includes("CHASSIS") ||
        value.includes("NUMBER") ||
        value.includes("OWNER") ||
        value.includes("ADDRESS")
      ) {
        continue;
      }
      const result = validator(value);
      console.log("VALUE=", value);
      console.log("RESULT=", result);
      if (result) {
        return value;
      }
    }
  }
  return "";
}

function extractExpiryDate(text) {
  const patterns = [
    /TO\s*:\s*(\d{2})[\/\-][A-Za-z]{3}[\/\-]\d{4}/gi,
    /VALID\s*UPTO\s*:\s*(\d{2})[\/\-][A-Za-z]{3}[\/\-]\d{4}/gi,
    /EXPIRY\s*DATE\s*:\s*(\d{2})[\/\-][A-Za-z]{3}[\/\-]\d{4}/gi,
    /TO\s*:\s*(\d{2})[\/\-]\d{4}/gi,
    /VALID\s*UPTO\s*:\s*(\d{2})[\/\-]\d{2}[\/\-]\d{4}/gi
  ];
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      return matches[matches.length - 1][1];
    }
  }
  return "";
}

async function extractRCData(text) {
  console.log(text);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let chassisNumber = "";
  let engineNumber = "";
  let registrationNumber = "";
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (
      !chassisNumber &&
      containsKeyword(currentLine, chassisKeywords)
    ) {
      chassisNumber = extractAfterKeyword(
        lines,
        i,
        isValidChassis
      );
    }

    if (!engineNumber && containsKeyword(currentLine, engineKeywords)) {
      console.log("current=>", currentLine);
      if (lines[i + 1]) console.log("next=>", lines[i + 1]);
      if (lines[i + 2]) console.log("next2=>", lines[i + 2]);
      const samelineMatches = currentLine
        .toUpperCase()
        .match(/([A-Z0-9]{6,25})/g);
      if (samelineMatches) {
        for (const match of samelineMatches) {
          const value = cleanValue(match);
          if (
            isValidEngine(value) &&
            value !== chassisNumber &&
            !value.includes("ENGINE") &&
            !value.includes("MOTOR")
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
        /([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4})/i
      );
      console.log("SAMELINE=", samelinereg);
      if (samelinereg) {
        registrationNumber = samelinereg[0];
      }
      console.log("CURRENT->", currentLine);
      if (lines[i + 1]) console.log("NEXT->", lines[i + 1]);
      if (lines[i + 2]) console.log("NEXT2->", lines[i + 2]);
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        const regMatch = lines[j].match(
          /([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4})/i
        );
        if (regMatch) {
          registrationNumber = regMatch[0];
          console.log("REG FOUND=>", registrationNumber);
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
    engineNumber = "";
  }

  return {
    chassisNumber,
    engineNumber,
    registrationNumber: cleanValue(registrationNumber)
  };
}

async function extractInsuranceData(text) {
  console.log(text);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let insuranceNumber = "";
  let insuranceExpiryDate = "";

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    console.log(i, currentLine);

    if (
      !insuranceNumber &&
      containsKeyword(currentLine, insuranceNumberKeywords)
    ) {
      insuranceNumber = extractAfterKeyword(
        lines,
        i,
        isValidInsuranceNumber
      );
    }

    console.log("CURRENT LINE=>", currentLine);
    if (
      !insuranceExpiryDate &&
      containsKeyword(currentLine, InsuranceExpiryKeywords)
    ) {
      console.log("FOUND KEYWORD");
      for (let j = i; j < i + 15 && j < lines.length; j++) {
        console.log(j, lines[j]);
      }
      console.log("INDEX==", i);
      const block = lines.slice(i, i + 15).join(" ");

      const dates = block.match(/(\d{2})[-/][A-Z]{3}[-/]\d{4}/gi);
      console.log("dates=", dates);
      if (dates && dates.length >= 2) {
        insuranceExpiryDate = dates[1];
        console.log("EXPIRYFOUND=", insuranceExpiryDate);
      } else if (dates && dates.length === 1) {
        insuranceExpiryDate = dates[0];
      }
    }
  }

  return {
    insuranceNumber,
    insuranceExpiryDate: formatDate(insuranceExpiryDate)
  };
}

async function extractPUCData(text) {
  console.log(text);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let pucNumber = "";
  let pucExpiryDate = "";

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (!pucNumber && containsKeyword(currentLine, pucNumberKeywords)) {
      pucNumber = extractAfterKeyword(
        lines,
        i,
        isValidPUCNumber
      );
    }

    if (
      !pucExpiryDate &&
      containsKeyword(currentLine, pucExpiryKeywords)
    ) {
      console.log("Found keyword:", currentLine);
      const block = lines.slice(i, i + 5).join(" ");
      console.log("BLOCK JSON=", JSON.stringify(block));
      const match = block.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      console.log("MATCH=", match);
      if (match) {
        pucExpiryDate = match[0];
        console.log("PUCEXPIRY=", pucExpiryDate);
      }
    }
  }

  return {
    pucNumber,
    pucExpiryDate: formatDate(pucExpiryDate)
  };
}

function findLastDate(block) {
  const matches = block.match(
    /(\d{2}[-\/][A-Za-z]{3}[-\/]\d{4}|\d{2}[-\/]\d{2}[-\/]\d{4})/gi
  );
  if (!matches) return "";
  return matches[matches.length - 1];
}

async function extractPermitData(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let permitNumber = "";
  let permitExpiryDate = "";

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (!permitNumber && containsKeyword(currentLine, permitNumberKeywords)) {
      permitNumber = extractAfterKeyword(
        lines,
        i,
        isValidPermitNumber
      );
    }

    const line = currentLine.toLowerCase();
    if (
      !permitExpiryDate &&
      line.includes("valid") &&
      line.includes("permit")
    ) {
      const block = lines.slice(i, i + 15).join(" ");
      console.log("BLOCK===>", block);
      permitExpiryDate = findLastDate(block);
      console.log("EXPIRY DATE===>", permitExpiryDate);
    }
  }

  return {
    permitNumber,
    permitExpiryDate: formatDate(permitExpiryDate)
  };
}

async function extractFitnessData(text) {
  console.log(text);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let fitnessExpiryDate = "";

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    if (
      !fitnessExpiryDate &&
      containsKeyword(currentLine, fitnessExpiryKeywords)
    ) {
      const block = lines.slice(i, i + 8).join(" ");
      console.log("FITNESS BLOCK===>", block);
      let searchText = block;
      if (block.toLowerCase().includes("fitness")) {
        const index = block
          .toLowerCase()
          .search(/fitness\s*valid\s*upto/);
        if (index !== -1) {
          searchText = block.substring(index);
          console.log("SEARCH TEXT ===>", searchText);
        }
      }

      const match = searchText.match(/(\d{2}[-\/][A-Za-z]{3}[-\/]\d{4})/);
      if (match) {
        fitnessExpiryDate = match[0];
      }
      console.log("FITNESS EXPIRY===>", fitnessExpiryDate);
    }
  }

  return {
    fitnessExpiryDate: formatDate(fitnessExpiryDate)
  };
}

module.exports = {
  extractRCData,
  extractInsuranceData,
  extractPUCData,
  extractPermitData,
  extractFitnessData
};
