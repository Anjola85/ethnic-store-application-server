import { MobileDto } from '../dto/mobile.dto';

export class MobileUtil {
  public isoCode: string;
  public isoType: string;
  public phoneNumber: string;

  constructor(isoCode?: string, isoType?: string, phoneNumber?: string) {
    // check if values are undefined, set default values
    if (!isoCode && !isoType && !phoneNumber) {
      this.isoCode = '+1';
      this.isoType = 'CA';
      this.phoneNumber = '';
    } else {
      this.isoCode = isoCode;
      this.isoType = isoType;
      this.phoneNumber = phoneNumber;
    }

    return this;
  }

  formatMobileDto = (mobile: MobileDto) => {
    this.isoCode = mobile.isoCode;
    this.isoType = mobile.isoType;
    this.phoneNumber = mobile.phoneNumber;
    return this;
  };

  getPhoneNumber(): string {
    if (!this.phoneNumber) {
      return '';
    }
    return this.phoneNumber;
  }

  toString(): string {
    return `MobileDto: ${JSON.stringify(this)}`;
  }

  getIsoCode(): string {
    return this.isoCode;
  }

  setIsoCode(isoCode: string): void {
    this.isoCode = isoCode;
  }

  getIsoType(): string {
    return this.isoType;
  }

  setIsoType(isoType: string): void {
    this.isoType = isoType;
  }

  getDto(): MobileDto {
    return {
      isoCode: this.isoCode,
      isoType: this.isoType,
      phoneNumber: this.phoneNumber,
    };
  }
}
