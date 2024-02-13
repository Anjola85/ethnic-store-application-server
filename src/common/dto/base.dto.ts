import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BaseDto {
  @ApiProperty({ description: 'test-description', example: 'test-value' })
  @IsOptional()
  id?;
}
