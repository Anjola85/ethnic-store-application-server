import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AddressDto } from 'src/modules/address/dto/address.dto';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateStoreSuggestionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  address: AddressDto;

  @IsNotEmpty()
  user: User;
}
