import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { merchantDto } from './merchant.dto';
import { PersonDTO } from './person.dto';

/**
 * Generic DTO
 * This class has all the possible fields required to register a user
 */
export class CreateUserDto extends PersonDTO {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'merchant' })
  profileType: string;
}
