import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { SendgridService } from './sendgrid/sendgrid.service';
import { Response } from 'express';
import TwilioService from './twilio/twilio.service';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { OTPCodeGenerator } from '../util/OTPCodeGenerator';

@Controller('verify')
export class SendgridController {
  constructor(
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
  ) {}

  /**
   * This endpoint sends an OTP code to the user's email address.
   * @param recieverEmail
   * @param res
   * @returns
   */
  @Post('sendOTPByEmail')
  async sendOTPByEmail(@Body() requestBody, @Res() res: Response) {
    try {
      const { id, email, codeLength, expirationMinutes } = requestBody;
      const result = await this.sendgridService.sendOTPEmail(
        id,
        email,
        codeLength,
        expirationMinutes,
      );
      return res.status(HttpStatus.OK).json({
        result,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return { error: 'Failed to send email' };
    }
  }

  /**
   * This endpoint sends an OTP code to the user's phone number.
   * @param requestBody
   * @returns
   */
  @Post('sendOTPBySms')
  async sendOTPBySms(@Body() requestBody: any) {
    const { to, body: messageBody } = requestBody;
    const options: MessageListInstanceCreateOptions = {
      to: to,
      body: 'Quickmart is live!',
      from: '+14314416827', // Replace with your Twilio phone number
    };

    try {
      await this.twilioService.sendSms(options);
      return { success: true, message: 'SMS sent successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to send SMS.' };
    }
  }

  // test endpoint
  @Get()
  async test(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'OTP controller works!',
    });
  }
}
