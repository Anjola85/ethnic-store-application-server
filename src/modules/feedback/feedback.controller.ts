import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { createResponse } from 'src/common/util/response';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('register')
  register(@Body() createFeedbackDto: CreateFeedbackDto) {
    try {
      const feedback = this.feedbackService.create(createFeedbackDto);
      return createResponse('Feedback created successfully', feedback);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('all')
  findAll() {
    return this.feedbackService.findAll();
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
