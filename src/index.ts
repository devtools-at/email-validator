/**
 * Email Validator
 * Validate email addresses
 *
 * Online tool: https://devtools.at/tools/email-validator
 *
 * @packageDocumentation
 */

function validateEmail(email: string): ValidationResult {
  const trimmedEmail = email.trim();
  const errors: string[] = [];
  const warnings: string[] = [];
  let suggestion: string | undefined;

  // Extract parts
  const atIndex = trimmedEmail.lastIndexOf("@");
  const localPart = atIndex > 0 ? trimmedEmail.substring(0, atIndex) : "";
  const domain = atIndex > 0 ? trimmedEmail.substring(atIndex + 1) : "";

  // Basic format check
  const hasValidFormat = EMAIL_REGEX.test(trimmedEmail);

  // Length checks
  const hasValidLength = trimmedEmail.length > 0 && trimmedEmail.length <= 320;
  if (trimmedEmail.length === 0) {
    errors.push("Email cannot be empty");
  } else if (trimmedEmail.length > 320) {
    errors.push("Email exceeds maximum length of 320 characters");
  }

  // Local part validation
  let hasValidLocalPart = true;
  if (localPart.length === 0) {
    errors.push("Missing local part (before @)");
    hasValidLocalPart = false;
  } else if (localPart.length > 64) {
    errors.push("Local part exceeds 64 characters");
    hasValidLocalPart = false;
  } else {
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      errors.push("Local part cannot start or end with a period");
      hasValidLocalPart = false;
    }
    if (localPart.includes("..")) {
      errors.push("Local part cannot contain consecutive periods");
      hasValidLocalPart = false;
    }
  }

  // Domain validation
  let hasValidDomain = true;
  if (domain.length === 0) {
    errors.push("Missing domain (after @)");
    hasValidDomain = false;
  } else if (domain.length > 255) {
    errors.push("Domain exceeds 255 characters");
    hasValidDomain = false;
  } else {
    // Check for typos in common domains
    if (DOMAIN_TYPOS[domain.toLowerCase()]) {
      suggestion = `${localPart}@${DOMAIN_TYPOS[domain.toLowerCase()]}`;
      warnings.push(`Did you mean "${DOMAIN_TYPOS[domain.toLowerCase()]}"?`);
    }

    if (domain.startsWith("-") || domain.endsWith("-")) {
      errors.push("Domain labels cannot start or end with hyphens");
      hasValidDomain = false;
    }
    if (domain.startsWith(".") || domain.endsWith(".")) {
      errors.push("Domain cannot start or end with a period");
      hasValidDomain = false;
    }
    if (domain.includes("..")) {
      errors.push("Domain cannot contain consecutive periods");
      hasValidDomain = false;
    }
    if (!domain.includes(".")) {
      warnings.push("Domain should typically include a TLD (e.g., .com, .org)");
    }

    // Check for common mistakes
    if (domain.includes(" ")) {
      errors.push("Domain cannot contain spaces");
      hasValidDomain = false;
    }
  }

  // Check for multiple @ symbols
  if ((trimmedEmail.match(/@/g) || []).length > 1) {
    errors.push("Email cannot contain multiple @ symbols");
  }

  // Check for missing @ symbol
  if (!trimmedEmail.includes("@")) {
    errors.push("Email must contain an @ symbol");
  }

  // Additional warnings
  if (trimmedEmail !== email) {
    warnings.push("Email has leading or trailing whitespace");
  }

  const isValid = hasValidFormat && hasValidLength && hasValidLocalPart && hasValidDomain && errors.length === 0;

  return {
    email: trimmedEmail,
    isValid,
    errors,
    warnings,
    suggestions: suggestion,
    details: {
      localPart,
      domain,
      hasValidFormat,
      hasValidLength,
      hasValidLocalPart,
      hasValidDomain,
    },
  };
}

// Export for convenience
export default { encode, decode };
