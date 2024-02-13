import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Timing {
  @IsNotEmpty()
  hour: number;

  @IsNotEmpty()
  minute: number;
}

export class DayScheduleDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Timing)
  open: Timing;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Timing)
  close: Timing;
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
