import {
  StoreSuggestionListRespDto,
  StoreSuggestionRespDto,
} from 'src/contract/version1/response/store-suggestion-response.dto';
import { StoreSuggestion } from './entities/store-suggestion.entity';
import { AddressProcessor } from '../address/address.processor';

export class StoreSuggestionProcessor {
  public static mapEntityToResp(
    storeSuggestion: StoreSuggestion,
  ): StoreSuggestionRespDto {
    const resp: StoreSuggestionRespDto = {
      id: storeSuggestion.id,
      name: storeSuggestion.name,
      address: AddressProcessor.mapEntityToResp(storeSuggestion.address),
      createdAt: storeSuggestion.createdAt,
    };
    return resp;
  }

  public static mapEntityListToResp(
    storeSuggestions: StoreSuggestion[],
  ): StoreSuggestionListRespDto {
    const storeSuggestionList = storeSuggestions.map((storeSuggestion) =>
      this.mapEntityToResp(storeSuggestion),
    );
    const payload: StoreSuggestionListRespDto = {
      storeSuggestionList: storeSuggestionList,
      size: storeSuggestionList.length,
    };
    return payload;
  }
}
