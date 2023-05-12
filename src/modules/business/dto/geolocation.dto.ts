import { IsNotEmpty, IsString } from 'class-validator';

export class GeoLocationDto {
  @IsNotEmpty()
  @IsString()
  latitude: string;

  @IsNotEmpty()
  @IsString()
  longitude: string;
}
