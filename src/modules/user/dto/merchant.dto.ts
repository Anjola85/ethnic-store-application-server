import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class merchantDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'The date of birth of the person' })
  dob: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'The url to the profile picture of the person' })
  profilePicture: string;
}
