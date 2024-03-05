import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Logger,
  Res,
} from '@nestjs/common';
import { StoreSuggestionService } from './store-suggestion.service';
import { CreateStoreSuggestionDto } from './dto/create-store-suggestion.dto';
import { UpdateStoreSuggestionDto } from './dto/update-store-suggestion.dto';
import { createResponse } from 'src/common/util/response';
import {
  StoreSuggestionListRespDto,
  StoreSuggestionRespDto,
} from 'src/contract/version1/response/store-suggestion-response.dto';
import { Response } from 'express';
import { encryptPayload } from 'src/common/util/crypto';

@Controller('store-suggestion')
export class StoreSuggestionController {
  private logger = new Logger('StoreSuggestionController');
  constructor(
    private readonly storeSuggestionService: StoreSuggestionService,
  ) {}

  @Post('add')
  async add(@Body() createStoreSuggestionDto: CreateStoreSuggestionDto) {
    try {
      this.logger.debug(`Add store suggestion endpoint called`);
      const storeSuggestion: StoreSuggestionRespDto =
        await this.storeSuggestionService.add(createStoreSuggestionDto);

      return createResponse(
        'Suggested store added successfully',
        storeSuggestion,
      );
    } catch (error) {
      this.logger.error(`Error while adding store suggestion: ${error}`);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async findAll(@Res() res: Response) {
    try {
      const userId = res.locals.userId;
      const crypto = res.locals.cryptoresp;
      const allStoreSuggestions: StoreSuggestionListRespDto =
        await this.storeSuggestionService.findAll(userId);

      if (crypto === 'true') {
        const encryptedResp = await encryptPayload(
          createResponse(
            'Successfully fetched store suggestions',
            allStoreSuggestions,
          ),
        );
        return res.status(HttpStatus.OK).json(encryptedResp);
      } else {
        return res
          .status(HttpStatus.OK)
          .json(
            createResponse(
              'Successfully fetched store suggestions',
              allStoreSuggestions,
            ),
          );
      }
    } catch (error) {
      this.logger.error(
        `Error while fetching all store suggestions with error: ${error}`,
      );
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeSuggestionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStoreSuggestionDto: UpdateStoreSuggestionDto,
  ) {
    return this.storeSuggestionService.update(+id, updateStoreSuggestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeSuggestionService.remove(+id);
  }
}
