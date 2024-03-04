import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { createResponse } from 'src/common/util/response';
import { Response } from 'express';
import { Feedback } from './entities/feedback.entity';
import { encryptPayload } from 'src/common/util/crypto';
import {
  FeedbackListRespDto,
  FeedbackRespDto,
} from 'src/contract/version1/response/feedback-response.dto';

@Controller('feedback')
export class FeedbackController {
  private logger = new Logger('FeedbackController');
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('add')
  async register(@Body() createFeedbackDto: CreateFeedbackDto) {
    try {
      this.logger.debug(`Add feedback endpoint called`);
      const feedback: FeedbackRespDto = await this.feedbackService.add(
        createFeedbackDto,
      );
      return createResponse('Feedback created successfully', feedback);
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async findAll(@Res() res: Response) {
    try {
      const userId = res.locals.userId;
      const crypto = res.locals.cryptoresp;
      const allFeedback: FeedbackListRespDto =
        await this.feedbackService.findAll(userId);

      if (crypto === 'true') {
        const encryptedResp = await encryptPayload(
          createResponse('Successfully fetched feedbacks', allFeedback),
        );
        return res.status(HttpStatus.OK).json(encryptedResp);
      } else {
        return res
          .status(HttpStatus.OK)
          .json(createResponse('Successfully fetched feedbacks', allFeedback));
      }
    } catch (error) {
      this.logger.error(`Error while fetching feedbacks with error: ${error}`);
      throw new HttpException(
        'Error while fetching feedbacks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all-feedback')
  findAllFeedback() {
    return null;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
