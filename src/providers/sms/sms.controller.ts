import { Controller, Post, Body } from '@nestjs/common';
import TwilioService from '../sendgrid/sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('sendSms')
  async sendSms(@Body() requestBody: any) {
    console.log('changed');
    // body.to = '+14378334178';
    // requestBody.to = '+16478074038';
    // requestBody.messageBody = 'Hello from QuickMart!';
    console.log('reqBody ', requestBody);
    console.log('shouldve printed');
    const { to, body: messageBody } = requestBody;
    const options = {
      to: to,
      body: messageBody,
      from: '+14314416827', // Replace with your Twilio phone number
    };

    try {
      // await this.twilioService.send(options);
      return { success: true, message: 'SMS sent successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to send SMS.' };
    }
  }
}
