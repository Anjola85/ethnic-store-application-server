export function createResponse(
  message?: string,
  payload = null,
  status = true,
) {
  return {
    status,
    message,
    payload,
  };
}

export function createError(message: string, error?: any) {
  return {
    message,
    error,
  };
}

export function encryptedResponse(encryptedData: string) {
  return {
    data: encryptedData,
  };
}
