import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  Logger,
  HttpException,
  ConflictException,
} from '@nestjs/common';
import { ContinentService } from './continent.service';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';
import { Response } from 'express';
import { createResponse } from 'src/common/util/response';

@Controller('continent')
export class ContinentController {
  private readonly logger = new Logger(ContinentController.name);
  constructor(private readonly continentService: ContinentService) {}

  @Post('register')
  async create(@Body() createContinentDto: CreateContinentDto): Promise<any> {
    try {
      const resp = await this.continentService.create(createContinentDto);
      return createResponse('Continent registered successfully', resp);
    } catch (err) {
      this.logger.debug(err);

      if (err instanceof ConflictException) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async findAll(): Promise<any> {
    try {
      const continent = await this.continentService.findAll();
      return createResponse('List of continents', {
        result: continent,
        size: continent.length,
      });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string, @Res() res: Response): Promise<any> {
  //   try {
  //     const continent = await this.continentService.findOne(id);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'user information fetched',
  //       continent,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to retrieve continent information',
  //       error: err.message,
  //     });
  //   }
  // }
  // @Patch('update/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateContinentDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     await this.continentService.update(id, updateUserDto);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'continent information updated',
  //       continent: updateUserDto.name,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to update continent information',
  //       error: err.message,
  //     });
  //   }
  // }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.continentService.remove(id);
  // }
}
