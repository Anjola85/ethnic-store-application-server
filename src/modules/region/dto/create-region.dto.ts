import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Continent } from 'src/modules/continent/entities/continent.entity';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the region',
  })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the continent the region belongs to',
  })
  continentId: Continent;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'The image of the country',
  })
  image?: Express.Multer.File;
}
