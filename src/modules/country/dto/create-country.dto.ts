import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCountryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the country',
  })
  name: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the continent the country belongs to',
  })
  regionId: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'The image of the country',
  })
  image?: Express.Multer.File;
}
