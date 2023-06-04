import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  isString,
} from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class TempUserAccountDto {
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MobileDto)
  @ApiProperty({
    description: 'The mobile phone number of the person',
    example: { phoneNumber: '1234567890', isoCode: '+1', isoType: 'CA' },
  })
  mobile: MobileDto;
}
