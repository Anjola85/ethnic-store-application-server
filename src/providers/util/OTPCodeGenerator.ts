export class OTPCodeGenerator {
  /**
   * This function generates a random code of a given length.
   * @param length
   * @returns
   */
  public generateCode(
    length = 4,
    expirationMinutes = 6,
  ): { code: string; expiryTime: string } {
    const digits = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      code += digits[randomIndex];
    }

    const time = new Date();
    time.setMinutes(time.getMinutes() + expirationMinutes);
    const expiryTime = new Date(time).toISOString();

    return { code, expiryTime };
  }
}
