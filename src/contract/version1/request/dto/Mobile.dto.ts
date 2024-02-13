import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MobileRespDto {
  @ApiProperty({ example: '6473334839' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '+1' })
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @ApiProperty({ example: 'CA' })
  @IsNotEmpty()
  @IsString()
  isoType: string;

  constructor(phoneNumber: string, countryCode: string, isoType: string) {
    this.phoneNumber = phoneNumber;
    this.countryCode = countryCode;
    this.isoType = isoType;
  }
}
