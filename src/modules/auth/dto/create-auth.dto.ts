import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'src/common/dto/base.dto';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateAuthDto extends BaseDto {
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    description: 'The email address of the person',
    example: 'johndoe@quickie.com',
  })
  email: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MobileDto)
  @ApiProperty({
    description: 'The mobile phone number of the person',
    example: { phone_number: '1234567890', country_code: '+1', iso_type: 'CA' },
  })
  mobile: MobileDto;

  @IsOptional()
  @IsBoolean()
  accountVerified?: boolean;

  @IsOptional()
  @IsString()
  otpCode?: string;

  @IsOptional()
  @IsDateString()
  otpExpiry?: Date;

  @IsOptional()
  user?: User;

  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}
