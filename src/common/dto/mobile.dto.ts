import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

/**
 * Defining the structire for the mobile field
 */
export class MobileDto {
  @ApiProperty({ example: '+14165555555' })
  @IsNotEmpty()
  @IsPhoneNumber('CA')
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'CA' })
  @IsNotEmpty()
  @IsString()
  isoCode: string;
}
