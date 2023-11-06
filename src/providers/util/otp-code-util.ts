/**
 * This function generates a random code of a given length.
 * @param length
 * @returns
 */
export function generateOtpCode(
  length = 4,
  expirationMinutes = 5,
): { code: string; expiryTime: string } {
  const digits = '0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }

  // set expirty time to be 5 minutes from now
  const expiryTime = new Date(
    Date.now() + expirationMinutes * 60 * 1000,
  ).toISOString();

  return { code, expiryTime };
}

// TO BE IMPLEMENTED
export function hashOtpCode(code: string): string {
  return '';
}
