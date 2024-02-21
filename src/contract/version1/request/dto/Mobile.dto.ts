import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MobileReqDto {
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

  @IsOptional()
  @IsNumber()
  id: number;
}
