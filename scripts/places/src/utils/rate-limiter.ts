/**
 * Rate limiter for Google Places API
 * Implements sliding window rate limiting to respect API quotas
 */
export class GooglePlacesRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Wait if necessary to stay within rate limits
   */
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Clean up old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if we need to wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 10; // +10ms buffer
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Clean up again after waiting
        const nowAfterWait = Date.now();
        this.requests = this.requests.filter(time => nowAfterWait - time < this.windowMs);
      }
    }
    
    // Record this request
    this.requests.push(Date.now());
  }

  /**
   * Get current request count in the window
   */
  getCurrentRequestCount(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length;
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.requests = [];
  }

  /**
   * Get time until next request is allowed
   */
  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.maxRequests) {
      return 0;
    }
    
    const now = Date.now();
    const oldestRequest = this.requests[0];
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }
}

/**
 * Exponential backoff retry utility
 */
export class ExponentialBackoff {
  private readonly baseDelay: number;
  private readonly maxDelay: number;
  private readonly maxRetries: number;
  private readonly backoffFactor: number;

  constructor(
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    maxRetries: number = 3,
    backoffFactor: number = 2
  ) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.maxRetries = maxRetries;
    this.backoffFactor = backoffFactor;
  }

  /**
   * Execute a function with exponential backoff retry
   */
  async execute<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: any) => void
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Calculate delay
        const delay = Math.min(
          this.baseDelay * Math.pow(this.backoffFactor, attempt),
          this.maxDelay
        );
        
        // Add jitter (±25% of delay)
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        const actualDelay = Math.max(0, delay + jitter);
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
    
    throw lastError;
  }

  /**
   * Calculate the delay for a given attempt
   */
  calculateDelay(attempt: number): number {
    return Math.min(
      this.baseDelay * Math.pow(this.backoffFactor, attempt),
      this.maxDelay
    );
  }
}
