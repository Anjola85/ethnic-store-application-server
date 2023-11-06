import { PartialType } from '@nestjs/mapped-types';
import { BusinessDto } from './business.dto';

export class UpdateBusinessDto extends PartialType(BusinessDto) {}
