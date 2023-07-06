import { ApiProperty } from '@nestjs/swagger';
import { User } from 'aws-sdk/clients/budgets';
import { UserAccount } from 'aws-sdk/clients/kendra';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { PersonDTO } from 'src/modules/user/dto/person.dto';

export class CreateAuthDto extends PersonDTO {
  @IsOptional()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  user_account_id: string;

  @IsOptional()
  @IsBoolean()
  account_verified?: boolean;

  @IsOptional()
  @IsString()
  verification_code?: string;

  @IsOptional()
  @IsDateString()
  verify_code_expiration?: Date;

  @IsOptional()
  @IsString()
  password_reset?: string;

  @IsOptional()
  @IsString()
  password_reset_code?: string;

  @IsOptional()
  @IsDateString()
  reset_code_expiration?: Date;

  @IsOptional()
  @IsBoolean()
  change_password?: boolean;

  @IsOptional()
  user?: any | User;

  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}
