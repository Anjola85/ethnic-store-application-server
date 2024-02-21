import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { SortOrder } from './sort-order';

export interface Generic {}

export class GenericFilter {
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNumber({}, { message: '"page" attribute should be a number' })
  @Min(1, { message: '"page" must be greater than or equal to 1' })
  public page = 1;

  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNumber({}, { message: '"pageSize" attribute should be a number' })
  @Min(1, { message: '"pageSize" must be greater than or equal to 1' })
  public pageSize = 10;

  @IsOptional()
  public orderBy?: string;

  @IsEnum(SortOrder, { message: '"sortOrder" must be a valid SortOrder value' })
  @IsOptional()
  public sortOrder?: SortOrder = SortOrder.DESC;
}
