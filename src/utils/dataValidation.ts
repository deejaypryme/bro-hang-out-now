/**
 * Data validation utilities for ensuring consistent backend responses
 * Prevents crashes from null/undefined data by providing safe defaults
 */

/**
 * Ensures a value is always an array, never null/undefined
 * @param data The data that should be an array
 * @param defaultValue Default array to return if data is invalid
 * @returns Always returns an array
 */
export const ensureArray = <T>(data: T[] | null | undefined, defaultValue: T[] = []): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  
  console.warn('⚠️ [dataValidation] Non-array data detected, returning default:', { data, defaultValue });
  return defaultValue;
};

/**
 * Validates API response structure and provides safe defaults
 * @param response The API response to validate
 * @returns Normalized response with guaranteed data structure
 */
export const validateApiResponse = <T>(response: {
  data?: T[] | null;
  error?: any;
}): {
  data: T[];
  error: any;
  hasError: boolean;
} => {
  return {
    data: ensureArray(response.data),
    error: response.error || null,
    hasError: !!response.error
  };
};

/**
 * Creates a user-friendly error message from various error types
 * @param error The error object or message
 * @param defaultMessage Default message if error is unclear
 * @returns User-friendly error message
 */
export const getUserFriendlyErrorMessage = (
  error: any, 
  defaultMessage: string = 'An unexpected error occurred. Please try again.'
): string => {
  if (!error) return defaultMessage;
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle error objects with userMessage (from DatabaseError class)
  if (error.userMessage && typeof error.userMessage === 'string') {
    return error.userMessage;
  }
  
  // Handle error objects with message
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }
  
  // Handle Supabase/PostgreSQL specific errors
  if (error.code) {
    switch (error.code) {
      case '23505':
        return 'This action has already been completed.';
      case '23503':
        return 'Invalid information provided.';
      case 'PGRST116':
        return 'The requested information was not found.';
      default:
        break;
    }
  }
  
  return defaultMessage;
};

/**
 * Validates that required fields are present in an object
 * @param obj The object to validate
 * @param requiredFields Array of required field names
 * @returns Validation result with missing fields
 */
export const validateRequiredFields = (
  obj: Record<string, any>, 
  requiredFields: string[]
): {
  isValid: boolean;
  missingFields: string[];
} => {
  const missingFields = requiredFields.filter(field => 
    obj[field] === null || obj[field] === undefined || obj[field] === ''
  );
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Safely extracts data from Supabase response and ensures array format
 * @param supabaseResponse The response from a Supabase query
 * @returns Safe data array and error information
 */
export const extractSupabaseData = <T>(supabaseResponse: {
  data: T[] | T | null;
  error: any;
}): {
  data: T[];
  error: any;
  hasError: boolean;
  userMessage?: string;
} => {
  const { data, error } = supabaseResponse;
  
  // Handle error cases
  if (error) {
    return {
      data: [],
      error,
      hasError: true,
      userMessage: getUserFriendlyErrorMessage(error)
    };
  }
  
  // Handle successful responses
  let normalizedData: T[] = [];
  
  if (Array.isArray(data)) {
    normalizedData = data;
  } else if (data !== null && data !== undefined) {
    // Single object response - convert to array
    normalizedData = [data];
  }
  // else: data is null/undefined, keep empty array
  
  return {
    data: normalizedData,
    error: null,
    hasError: false
  };
};
