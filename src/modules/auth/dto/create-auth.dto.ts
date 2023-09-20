import { ApiProperty } from '@nestjs/swagger';
import { User } from 'aws-sdk/clients/budgets';
import { UserAccount } from 'aws-sdk/clients/kendra';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { PersonDTO } from 'src/modules/user/dto/person.dto';

export class CreateAuthDto {
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
  verificationCode?: string;

  @IsOptional()
  @IsDateString()
  verificationCodeExpiration?: Date;

  @IsOptional()
  user?: User;

  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}
