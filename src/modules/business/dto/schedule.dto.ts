import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DayScheduleDto {
  @IsString()
  @IsNotEmpty()
  open: string;

  @IsString()
  @IsNotEmpty()
  close: string;
}

export class ScheduleDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  monday: DayScheduleDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  tuesday: DayScheduleDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  wednesday: DayScheduleDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  thursday: DayScheduleDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  friday: DayScheduleDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  saturday: DayScheduleDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  sunday: DayScheduleDto;
}
