import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsNotEmpty, IsString } from 'class-validator';

export class CreateContinentDto {
  @IsNotEmpty()
  @IsLowercase()
  @IsString()
  @ApiProperty({ description: 'grocery' })
  name: string;
}
