import { Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { Response } from 'express';

@Controller('mail')
export class SendgridController {
  constructor(private readonly sendgridService: SendgridService) {}

  @Post('sendEmail')
  async sendEmail(@Query('email') email, @Res() res: Response) {
    try {
      const emailAddress = await res.locals.email;
      const result = await this.sendgridService.sendEmail(email, emailAddress);
      // mask otpCode being sent from result
      result.otpCode = '****';
      return res.status(HttpStatus.OK).json({
        result,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return { error: 'Failed to send email' };
    }
  }

  // test endpoint
  @Get()
  async test(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'it works',
    });
  }
}
