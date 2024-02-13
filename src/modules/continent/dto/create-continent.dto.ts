import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsNotEmpty, IsString } from 'class-validator';

export class CreateContinentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'africa' })
  name: string;
}
