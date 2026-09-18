/**
 * Utility functions for standardized error handling and normalization across LifeSync Frontend.
 * Adheres to Clean Code principles and supports Bean Validation error mapping.
 */

export interface ParsedApiError {
  message: string;
  fieldErrors?: Record<string, string>;
  isNetworkError: boolean;
  status?: number;
}

/**
 * Parses and normalizes any API or runtime error into a user-friendly Vietnamese format.
 * Accurately extracts field-level validation errors returned by Spring Boot.
 */
export const parseApiError = (error: any): ParsedApiError => {
  if (!error) {
    return {
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại!',
      isNetworkError: false,
    };
  }

  // 1. Check for Network / Connection errors (Backend unreachable, CORS, Offline)
  const isNetworkRefused =
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    (error.isAxiosError && !error.response) ||
    error.name === 'NetworkError';

  if (isNetworkRefused) {
    return {
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc đảm bảo Backend đang chạy!',
      isNetworkError: true,
      status: 0,
    };
  }

  // 2. Extract Response details from Axios / Fetch error structure
  const responseData = error.response?.data || error.data || error;
  const status = error.response?.status || error.status;

  // 3. Server Gateway / Maintenance errors
  if (status === 502 || status === 503 || status === 504) {
    return {
      message: 'Máy chủ hiện đang bảo trì hoặc quá tải. Vui lòng thử lại sau ít phút!',
      isNetworkError: true,
      status,
    };
  }

  // 4. Spring Boot Bean Validation Errors (HTTP 400 with Map<String, String> data)
  if (responseData && typeof responseData === 'object') {
    let fieldErrors: Record<string, string> | undefined = undefined;

    if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
      fieldErrors = responseData.data as Record<string, string>;
    }

    const baseMessage =
      responseData.message ||
      (typeof responseData.error === 'string' ? responseData.error : null) ||
      error.message ||
      'Yêu cầu không hợp lệ!';

    return {
      message: baseMessage,
      fieldErrors,
      isNetworkError: false,
      status,
    };
  }

  // 5. Fallback string error
  const fallbackMessage = typeof error === 'string' ? error : error.message || 'Đã xảy ra lỗi hệ thống!';
  return {
    message: fallbackMessage,
    isNetworkError: false,
    status,
  };
};

/**
 * Helper to get a specific field error message safely.
 */
export const getFieldError = (
  fieldErrors: Record<string, string> | undefined | null,
  fieldName: string
): string | null => {
  if (!fieldErrors) return null;
  return fieldErrors[fieldName] || null;
};
