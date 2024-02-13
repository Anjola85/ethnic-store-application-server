import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreSuggestionDto } from './create-store-suggestion.dto';

export class UpdateStoreSuggestionDto extends PartialType(CreateStoreSuggestionDto) {}
