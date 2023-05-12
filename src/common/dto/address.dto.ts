import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Defining the structire for the address field
 */
export class AddressDto {
  @ApiProperty({ example: '123 Main St' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: 'Toronto' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Ontario' })
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiProperty({ example: 'Q1Z 3KL' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'Canada' })
  @IsNotEmpty()
  @IsString()
  country: string;
}
