import { MobileDto } from '../dto/mobile.dto';

export class MobileUtil {
  public country_code: string;
  public iso_type: string;
  public phone_number: string;

  constructor(country_code?: string, iso_type?: string, phone_number?: string) {
    // check if values are undefined, set default values
    if (!country_code && !iso_type && !phone_number) {
      this.country_code = '+1';
      this.iso_type = 'CA';
      this.phone_number = '';
    } else {
      this.country_code = country_code;
      this.iso_type = iso_type;
      this.phone_number = phone_number;
    }

    return this;
  }

  formatMobileDto = (mobile: MobileDto) => {
    this.country_code = mobile.country_code;
    this.iso_type = mobile.iso_type;
    this.phone_number = mobile.phone_number;
    return this;
  };

  getPhoneNumber(): string {
    if (!this.phone_number) {
      return '';
    }
    return this.phone_number;
  }

  toString(): string {
    return `MobileDto: ${JSON.stringify(this)}`;
  }

  getIsoCode(): string {
    return this.country_code;
  }

  setIsoCode(country_code: string): void {
    this.country_code = country_code;
  }

  getIsoType(): string {
    return this.iso_type;
  }

  setIsoType(iso_type: string): void {
    this.iso_type = iso_type;
  }

  getDto(): MobileDto {
    return {
      country_code: this.country_code,
      iso_type: this.iso_type,
      phone_number: this.phone_number,
    };
  }
}
