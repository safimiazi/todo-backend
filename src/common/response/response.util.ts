// src/common/utils/response.util.ts
export function successResponse<T>(data: T, message = 'Success') {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message = 'Something went wrong', statusCode = 400) {
  return {
    success: false,
    message,
    statusCode,
  };
}
