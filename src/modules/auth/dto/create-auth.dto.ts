import { User } from 'aws-sdk/clients/budgets';
import { UserAccount } from 'aws-sdk/clients/kendra';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
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
