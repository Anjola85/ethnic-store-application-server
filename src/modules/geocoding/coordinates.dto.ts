import { IsNotEmpty } from 'class-validator';

export class Coordinates {
  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  longitude: number;
}
