import { PartialType } from '@nestjs/mapped-types';
import { CreateFavouriteDto } from './create-favourite.dto';
import { Favourite } from '../entities/favourite.entity';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFavouriteDto {
  @ApiProperty({
    description: 'The favouriteID this favourite belongs to',
    required: true,
  })
  @IsNotEmpty()
  favourite: Favourite;
}
