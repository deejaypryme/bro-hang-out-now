
interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  shouldRetry: (error: any) => boolean,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt or if error is not retryable
      if (attempt === config.maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay
      let delay = config.baseDelay;
      if (config.exponentialBackoff) {
        delay = Math.min(config.baseDelay * Math.pow(2, attempt - 1), config.maxDelay);
      }
      
      console.log(`Retry attempt ${attempt} failed, retrying in ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
