/**
 * Password Validation Utility
 * Ensures passwords meet strong security requirements
 */

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  allowedSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, errors: string[], suggestions: string[] }
 */
exports.validatePassword = (password) => {
  const errors = [];
  const suggestions = [];

  // Check if password is provided
  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors, suggestions };
  }

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long (currently ${password.length})`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSymbols) {
    const hasSymbol = new RegExp(`[${PASSWORD_REQUIREMENTS.allowedSymbols.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password);
    if (!hasSymbol) {
      errors.push(`Password must contain at least one special character: ${PASSWORD_REQUIREMENTS.allowedSymbols}`);
    }
  }

  // Provide suggestions if password is weak
  if (errors.length > 0) {
    suggestions.push('Example strong password: SecurePass123!');
    suggestions.push('Mix upper and lowercase letters, add numbers and symbols');
  }

  return {
    valid: errors.length === 0,
    errors,
    suggestions,
    requirements: {
      minLength: PASSWORD_REQUIREMENTS.minLength,
      uppercase: PASSWORD_REQUIREMENTS.requireUppercase,
      lowercase: PASSWORD_REQUIREMENTS.requireLowercase,
      numbers: PASSWORD_REQUIREMENTS.requireNumbers,
      symbols: PASSWORD_REQUIREMENTS.requireSymbols,
      allowedSymbols: PASSWORD_REQUIREMENTS.allowedSymbols
    }
  };
};

/**
 * Get password strength score (0-100)
 * @param {string} password - Password to check
 * @returns {number} Strength score (0-100)
 */
exports.getPasswordStrength = (password) => {
  let score = 0;

  if (!password) return 0;

  // Length score (0-30)
  if (password.length >= PASSWORD_REQUIREMENTS.minLength) score += 15;
  if (password.length >= 12) score += 15;

  // Character variety score (0-70)
  if (/[A-Z]/.test(password)) score += 17.5;
  if (/[a-z]/.test(password)) score += 17.5;
  if (/[0-9]/.test(password)) score += 17.5;
  if (new RegExp(`[${PASSWORD_REQUIREMENTS.allowedSymbols.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password)) score += 17.5;

  return Math.min(100, Math.round(score));
};

/**
 * Get password strength label
 * @param {number} score - Password strength score
 * @returns {string} Strength label
 */
exports.getStrengthLabel = (score) => {
  if (score < 25) return 'Very Weak';
  if (score < 50) return 'Weak';
  if (score < 75) return 'Fair';
  if (score < 90) return 'Good';
  return 'Strong';
};

/**
 * Check all password requirements met
 * @param {string} password - Password to check
 * @returns {Object} Requirements status
 */
exports.checkRequirements = (password) => {
  const hasMinLength = password && password.length >= PASSWORD_REQUIREMENTS.minLength;
  const hasUppercase = /[A-Z]/.test(password || '');
  const hasLowercase = /[a-z]/.test(password || '');
  const hasNumbers = /[0-9]/.test(password || '');
  const hasSymbols = new RegExp(`[${PASSWORD_REQUIREMENTS.allowedSymbols.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(password || '');

  return {
    minLength: { met: hasMinLength, label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters` },
    uppercase: { met: hasUppercase, label: 'One uppercase letter (A-Z)' },
    lowercase: { met: hasLowercase, label: 'One lowercase letter (a-z)' },
    numbers: { met: hasNumbers, label: 'One number (0-9)' },
    symbols: { met: hasSymbols, label: `One special character: ${PASSWORD_REQUIREMENTS.allowedSymbols}` }
  };
};

module.exports = {
  validatePassword: exports.validatePassword,
  getPasswordStrength: exports.getPasswordStrength,
  getStrengthLabel: exports.getStrengthLabel,
  checkRequirements: exports.checkRequirements,
  PASSWORD_REQUIREMENTS
};
