import { Controller, Post, Query } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';

@Controller('mail')
export class SendgridController {
  constructor(private readonly sendgridService: SendgridService) {}

  @Post('send-email')
  async sendEmail(@Query('email') email) {
    const mail = {
      to: email,
      subject: 'Hello from sendgrid',
      from: '...', // Fill it with your validated email on SendGrid account
      text: 'Hello',
      html: '<h1>Hello</h1>',
    };
    return await this.sendgridService.send(mail);
  }
}
