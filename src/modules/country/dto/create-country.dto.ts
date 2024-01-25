import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCountryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the country',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The ID of the continent the country belongs to',
  })
  continentId: Types.ObjectId;
}
