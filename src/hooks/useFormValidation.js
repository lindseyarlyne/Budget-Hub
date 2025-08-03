import { useState, useCallback, useMemo } from 'react';

export const useFormValidation = (formData, validationRules) => {
  const [errors, setErrors] = useState({});

  // Memoized validation function
  const validateField = useCallback((field, value, rules) => {
    if (!rules) return null;

    if (rules.required && (!value || value === '')) {
      return rules.message || `${field} is required`;
    }

    if (value && rules.min && Number(value) < rules.min) {
      return rules.message || `${field} must be at least ${rules.min}`;
    }

    if (value && rules.max && Number(value) > rules.max) {
      return rules.message || `${field} must be no more than ${rules.max}`;
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      return rules.message || `${field} must be at least ${rules.minLength} characters`;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `${field} must be no more than ${rules.maxLength} characters`;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      return rules.message || `${field} format is invalid`;
    }

    if (value && rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return rules.message || 'Invalid email format';
    }

    return null;
  }, []);

  // Validate all fields
  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field], validationRules[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules, validateField]);

  // Validate single field (for real-time validation)
  const validateSingleField = useCallback((field) => {
    const error = validateField(field, formData[field], validationRules[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    return !error;
  }, [formData, validationRules, validateField]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Check if form is valid (memoized)
  const isValid = useMemo(() => {
    // Check if all required fields have values and no errors exist
    const hasErrors = Object.values(errors).some(error => error !== null && error !== '');
    
    const hasAllRequiredFields = Object.keys(validationRules).every(field => {
      const rules = validationRules[field];
      if (rules.required) {
        const value = formData[field];
        return value !== null && value !== undefined && value !== '';
      }
      return true;
    });

    return !hasErrors && hasAllRequiredFields;
  }, [errors, formData, validationRules]);

  return {
    errors,
    validate,
    validateSingleField,
    clearErrors,
    isValid
  };
};