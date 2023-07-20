import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { Response } from 'express';

@Controller('addFavourite')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  /**
   * Adds a favourited business with the customer id to the database
   * @param createFavouriteDto
   * @param res
   * @returns
   */
  @Post('addFavourite')
  async addFavourite(
    @Body() createFavouriteDto: CreateFavouriteDto,
    @Res() res: Response,
  ) {
    try {
      const resp = await this.favouriteService.addFavourite(createFavouriteDto);

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'favourites successfully created',
        favourites: resp,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to create favourites',
        error: err.message,
      });
    }
  }

  /**
   * Gets all favourited businesses by taking in the customer id
   * @param id - customer id
   * @returns
   */
  @Get('userFavourites')
  async getFavourites(@Param('id') custId: string, @Res() res: Response) {
    try {
      //const custId = res.locals.userId;
      const favouritedBusinesses = await this.favouriteService.getFavourites(
        custId,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'favourites successfully retrieved',
        favourites: favouritedBusinesses,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to retrieve favourites',
        error: err.message,
      });
    }
  }

  /**
   * This unfavourites a business by taking in the business id
   * @param id - business id
   * @returns
   */
  @Post('removeFavourite')
  async removeFavourite(
    @Body() body: { custId: string; businessId: string },
    @Res() res: Response,
  ) {
    try {
      const { custId, businessId } = body;
      const unfavouritedBusiness = await this.favouriteService.removeFavourite(
        custId,
        businessId,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'favourite successfully removed',
        favourite: unfavouritedBusiness,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to remove favourite',
        error: err.message,
      });
    }
  }
}
