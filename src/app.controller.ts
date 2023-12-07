import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Post('test-validation')
  // testValidation(@Body('user') body: CreateAppDto) {
  //   return 'successfull validation with body: ' + body;
  // }
}