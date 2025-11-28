/**
 * Utility functions for handling retries with exponential backoff
 */

// Maximum number of retry attempts
const MAX_RETRIES = 3;

// Initial delay in milliseconds
const INITIAL_DELAY = 1000;

// Maximum delay between retries
const MAX_DELAY = 10000;

/**
 * Implements exponential backoff retry logic
 * @param {Function} operation - The async operation to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Resolves with operation result or rejects after max retries
 */
export const retryWithBackoff = async (
  operation,
  {
    maxRetries = MAX_RETRIES,
    initialDelay = INITIAL_DELAY,
    maxDelay = MAX_DELAY,
    onRetry = null
  } = {}
) => {
  let lastError = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt - 1),
        maxDelay
      );

      // Add some randomness to prevent multiple clients from retrying simultaneously
      const jitter = Math.random() * 1000;
      const totalDelay = delay + jitter;

      if (onRetry) {
        onRetry({
          error: lastError,
          attempt,
          delay: totalDelay,
          remainingAttempts: maxRetries - attempt
        });
      }

      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw new Error(
    `Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`
  );
};

/**
 * Checks if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is retryable
 */
export const isRetryableError = (error) => {
  // Handle undefined or null errors
  if (!error) {
    return false;
  }

  // Network errors are generally retryable
  if (error instanceof TypeError && error.message.includes('network')) {
    return true;
  }

  // Certain HTTP status codes indicate retryable errors
  if (error && error.status) {
    return [408, 429, 500, 502, 503, 504].includes(error.status);
  }

  // Stream-specific errors that might be temporary
  if (error instanceof MediaError) {
    return [MediaError.MEDIA_ERR_NETWORK, MediaError.MEDIA_ERR_DECODE].includes(error.code);
  }

  return false;
};