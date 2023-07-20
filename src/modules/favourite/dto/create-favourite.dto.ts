import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFavouriteDto {
  @ApiProperty({
    description: 'The businessID this favourite belongs to',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly businessId: string;

  @ApiProperty({
    description: 'The customerID this favourite belongs to',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly customerId: string;
}
