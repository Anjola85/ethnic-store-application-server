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
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login a user
   * @param loginDto
   * @param res
   * @returns {*}
   */
  @Post('login')
  async login(@Body() loginDto: loginDto, @Res() res: Response) {
    try {
      const response: any = await this.authService.login(loginDto);

      return res.status(HttpStatus.OK).json({
        message: response.message,
        token: response.token,
        user: response.user,
      });
    } catch (error) {
      if (error instanceof InternalServerError) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `login failed from auth.controller.ts`,
          error: error.message,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `login failed from auth.controller.ts`,
          error: error.message,
        });
      }
    }
  }

  @Post()
  async create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto, '');
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
