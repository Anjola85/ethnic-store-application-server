import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class LoginOtpRequest {
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MobileDto)
  @ApiProperty({
    description: 'The mobile phone number of the person',
    example: { phone_number: '1234567890', country_code: '+1', iso_type: 'CA' },
  })
  mobile: MobileDto;

  constructor(email: string, mobile: MobileDto) {
    this.email = email;
    this.mobile = mobile;
  }
}
