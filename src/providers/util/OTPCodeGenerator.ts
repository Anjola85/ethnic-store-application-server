export class OTPCodeGenerator {
  /**
   * This function generates a random code of a given length.
   * @param length
   * @returns
   */
  public generateCode(
    length = 4,
    expirationMinutes = 5,
  ): { code: string; expiryTime: Date } {
    const digits = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      code += digits[randomIndex];
    }

    // come up with an expiry time of 5 minutes for the code
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expirationMinutes);

    return { code, expiryTime };
  }
}
