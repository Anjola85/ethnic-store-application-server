import { IsNotEmpty, IsString, isString } from 'class-validator';

export class loginDto {
  @IsString()
  email?: string;

  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  constructor() {
    this.email = '';
    this.phone = '';
    this.password = '';
  }
}
