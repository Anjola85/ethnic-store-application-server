import { PartialType } from '@nestjs/mapped-types';
import { CreateRegionDto } from './create-region.dto';
import { Continent } from 'src/modules/continent/entities/continent.entity';

export class UpdateRegionDto extends PartialType(CreateRegionDto) {
  name: string;
  imageUrl: string;
  continentId: Continent;
}
