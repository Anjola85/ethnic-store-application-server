export class OtpResponse {
  message: string;
  token: string;
  code: string;
  expiryTime: string;

  constructor(
    message: string,
    token: string,
    code: string,
    expiryTime: string,
  ) {
    this.message = message;
    this.token = token;
    this.code = code;
    this.expiryTime = expiryTime;
  }
}
