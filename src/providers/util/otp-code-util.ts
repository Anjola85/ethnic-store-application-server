import { getCurrentEpochTime } from 'src/common/util/functions';

/**
 * This function generates a random code of a given length.
 * @param length
 * @returns
 */
export function generateOtpCode(
  length = 4,
  expirationMinutes = 5,
): { code: string; expiryTime: number } {
  const digits = '0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }

  // set expirty time to be 5 minutes from now
  // const expiryTime = new Date(
  //   Date.now() + expirationMinutes * 60 * 1000,
  // ).toISOString();

  // set expiry time to be 5 minutes from now
  const expiryTime = getCurrentEpochTime() + expirationMinutes * 60;

  return { code, expiryTime };
}

// TO BE IMPLEMENTED
export function hashOtpCode(code: string): string {
  return '';
}
