import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Business } from 'src/modules/business/entities/business.entity';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateFavouriteDto {
  @ApiProperty({
    description: 'The businessID this favourite belongs to',
    required: true,
  })
  @IsNotEmpty()
  readonly business: Business;
}
