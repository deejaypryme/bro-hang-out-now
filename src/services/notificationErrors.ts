
export enum NotificationErrorType {
  INVALID_CONTACT = 'INVALID_CONTACT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface NotificationError {
  type: NotificationErrorType;
  message: string;
  retryable: boolean;
  details?: any;
}

export class NotificationServiceError extends Error {
  public readonly type: NotificationErrorType;
  public readonly retryable: boolean;
  public readonly details?: any;

  constructor(type: NotificationErrorType, message: string, retryable: boolean = false, details?: any) {
    super(message);
    this.name = 'NotificationServiceError';
    this.type = type;
    this.retryable = retryable;
    this.details = details;
  }
}

export const createUserFriendlyErrorMessage = (error: NotificationServiceError, contactType: 'sms' | 'email'): string => {
  switch (error.type) {
    case NotificationErrorType.INVALID_CONTACT:
      return contactType === 'sms' 
        ? 'The phone number format is invalid. Please check and try again.'
        : 'The email address format is invalid. Please check and try again.';
    
    case NotificationErrorType.SERVICE_UNAVAILABLE:
      return `${contactType === 'sms' ? 'SMS' : 'Email'} service is temporarily unavailable. Please try again in a few minutes.`;
    
    case NotificationErrorType.RATE_LIMITED:
      return `Too many ${contactType === 'sms' ? 'SMS' : 'email'} requests. Please wait a moment before trying again.`;
    
    case NotificationErrorType.AUTHENTICATION_FAILED:
      return `${contactType === 'sms' ? 'SMS' : 'Email'} service authentication failed. Please contact support.`;
    
    case NotificationErrorType.DELIVERY_FAILED:
      return contactType === 'sms'
        ? 'SMS could not be delivered. The number may be invalid or unable to receive messages.'
        : 'Email could not be delivered. Please check the email address.';
    
    case NotificationErrorType.NETWORK_ERROR:
      return 'Network connection failed. Please check your internet connection and try again.';
    
    default:
      return `Failed to send ${contactType} notification. Please try again or contact support.`;
  }
};

export const parseErrorResponse = (error: any, contactType: 'sms' | 'email'): NotificationServiceError => {
  // Parse Twilio SMS errors
  if (contactType === 'sms' && error.code) {
    switch (error.code) {
      case 21211:
      case 21614:
        return new NotificationServiceError(
          NotificationErrorType.INVALID_CONTACT,
          'Invalid phone number format',
          false,
          error
        );
      case 21408:
      case 21610:
        return new NotificationServiceError(
          NotificationErrorType.DELIVERY_FAILED,
          'Phone number blocked or opted out',
          false,
          error
        );
      case 30001:
      case 30002:
        return new NotificationServiceError(
          NotificationErrorType.RATE_LIMITED,
          'SMS rate limit exceeded',
          true,
          error
        );
      case 30003:
      case 30004:
      case 30005:
        return new NotificationServiceError(
          NotificationErrorType.DELIVERY_FAILED,
          'SMS delivery failed',
          false,
          error
        );
      default:
        return new NotificationServiceError(
          NotificationErrorType.SERVICE_UNAVAILABLE,
          'SMS service error',
          true,
          error
        );
    }
  }

  // Parse email errors
  if (contactType === 'email') {
    if (error.message?.includes('domain')) {
      return new NotificationServiceError(
        NotificationErrorType.AUTHENTICATION_FAILED,
        'Email domain verification required',
        false,
        error
      );
    }
    if (error.message?.includes('Invalid email')) {
      return new NotificationServiceError(
        NotificationErrorType.INVALID_CONTACT,
        'Invalid email address',
        false,
        error
      );
    }
  }

  // Parse network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new NotificationServiceError(
      NotificationErrorType.NETWORK_ERROR,
      'Network connection failed',
      true,
      error
    );
  }

  // Default error
  return new NotificationServiceError(
    NotificationErrorType.UNKNOWN_ERROR,
    error.message || 'Unknown error occurred',
    true,
    error
  );
};
