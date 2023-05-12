import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { PersonDTO } from 'src/modules/user/dto/person.dto';

export class CreateUserAccountDto extends PersonDTO {}
