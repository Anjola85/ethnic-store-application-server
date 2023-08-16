export function createResponse(message?: string, data = null, status = true) {
  return {
    status,
    message,
    data,
  };
}

export function createError(message: string, error?: any) {
  return {
    message,
    error,
  };
}
