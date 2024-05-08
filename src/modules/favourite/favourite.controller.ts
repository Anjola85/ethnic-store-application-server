import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { Response } from 'express';
import {
  ApiResponse,
  createResponse,
  extractIdFromRequest,
  handleCustomResponse,
  TokenIdType,
} from 'src/common/util/response';
import { encryptPayload } from 'src/common/util/crypto';
import {
  FavouriteListRespDto,
  FavouriteRespDto,
} from 'src/contract/version1/response/favourite-response.dto';
import { UpdateFavouriteDto } from './dto/update-favourite.dto';

@Controller('favourite')
export class FavouriteController {
  private readonly logger = new Logger(FavouriteController.name);
  constructor(private readonly favouriteService: FavouriteService) {}

  @Post('add')
  async addFavourite(
    @Body() createFavouriteDto: CreateFavouriteDto,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('add favourite endpoint called');
      const userId: number = extractIdFromRequest(res, TokenIdType.userId);
      const favourite: FavouriteRespDto =
        await this.favouriteService.addToFavourites(
          userId,
          createFavouriteDto.business,
        );
      this.logger.log('Favourite successfully added');
      const apiResp: ApiResponse = createResponse(
        'Favourite successfully added',
        favourite,
      );
      console.log('response to client: ' + apiResp);
      return handleCustomResponse(res, apiResp);
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.controller.ts, create method: ' +
          error +
          ' with error message: ' +
          error.message,
      );

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Somthing went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user')
  async getFavouriteByUserId(@Res() res: Response) {
    try {
      this.logger.log('get favourite by user id endpoint called');

      const userId: number = res.locals.userId;
      const crypto = res.locals.cryptoresp;

      if (!userId) {
        throw new HttpException(
          'Unable to perform operation, user not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const favouriteList: FavouriteListRespDto =
        await this.favouriteService.getFavouriteByUserId(userId);

      this.logger.log('Favourite list successfully retrieved');

      if (crypto === 'true') {
        const encryptedResponse = await encryptPayload(
          createResponse(
            'Favourite list successfully retrieved',
            favouriteList,
          ),
        );

        return res.status(HttpStatus.OK).json(encryptedResponse);
      } else {
        return res
          .status(HttpStatus.OK)
          .json(
            createResponse(
              'Favourite list successfully retrieved',
              favouriteList,
            ),
          );
      }
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.controller.ts, getFavouriteByUserId method: ' +
          error +
          ' with error message: ' +
          error.message,
      );

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Somthing went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('remove')
  async removeFromFavourites(@Body() updateFavourite: UpdateFavouriteDto) {
    try {
      this.logger.log('remove from favourite endpoint called');

      if (!updateFavourite && !updateFavourite.favourite) {
        throw new HttpException(
          'Favourite id not provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.favouriteService.removeFromFavourites(
        updateFavourite.favourite,
      );

      return createResponse('Favourite successfully removed');
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.controller.ts, removeFromFavourites method: ' +
          error +
          ' with error message: ' +
          error.message,
      );

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Somthing went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
