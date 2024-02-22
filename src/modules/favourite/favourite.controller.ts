import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { Response } from 'express';
import { Types } from 'mongoose';
import { createResponse } from 'src/common/util/response';

@Controller('favourite')
export class FavouriteController {
  private readonly logger = new Logger(FavouriteController.name);
  constructor(private readonly favouriteService: FavouriteService) {}

  @Post()
  async create(@Body() createFavouriteDto: CreateFavouriteDto) {
    try {
      this.logger.log('create favourite endpoint called');

      const favourite = await this.favouriteService.addToFavourites(
        createFavouriteDto.user,
        createFavouriteDto.business,
      );
      return createResponse('Favourite successfully added', favourite);
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.controller.ts, create method: ' +
          error +
          ' with error message: ' +
          error.message,
      );

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Somthing wen wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getFavouriteByUserId(@Param('id') id: string, @Res() res: Response) {
    const favouriteList = await this.favouriteService.getFavouriteByUserId(
      parseInt(id),
    );
    return res.status(HttpStatus.OK).json(favouriteList);
  }

  @Post('remove')
  async removeFromFavourites(
    @Body('favouriteId') favouriteId: string,
    @Body('userId') userId: string,
    @Body('businessId') businessId: string,
    @Res() res: Response,
  ) {
    await this.favouriteService.removeFromFavourites(
      favouriteId,
      parseInt(userId),
      businessId,
    );
    return res.status(HttpStatus.OK).json({ message: 'Favourite removed' });
  }
}
