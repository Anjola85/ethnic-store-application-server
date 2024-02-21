import { AddressRespDto } from './address-response.dto';

export interface StoreSuggestionRespDto {
  id: number;
  name: string;
  address: AddressRespDto;
  createdAt: number;
}

export interface StoreSuggestionListRespDto {
  storeSuggestionList: StoreSuggestionRespDto[];
  size: number;
}
