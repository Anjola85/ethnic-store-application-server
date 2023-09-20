import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DayScheduleDto {
  open: string;

  close: string;
}

export class ScheduleDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  monday?: DayScheduleDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  tuesday?: DayScheduleDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  wednesday?: DayScheduleDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  thursday?: DayScheduleDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  friday?: DayScheduleDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  saturday?: DayScheduleDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  sunday?: DayScheduleDto;
}
