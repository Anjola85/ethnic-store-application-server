/**
 * Business logic to handle feedback related operations
 * Feedback is a user's opinion about a product or service
 */
import { Injectable, Logger } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import {
  FeedbackListRespDto,
  FeedbackRespDto,
} from 'src/contract/version1/response/feedback-response.dto';
import { FeedbackProcessor } from './feedback.processor';

@Injectable()
export class FeedbackService {
  private logger = new Logger('FeedbackService');

  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  /**
   * This function adds a new feedback to the database
   * @param createFeedbackDto
   * @returns
   */
  async add(createFeedbackDto: CreateFeedbackDto): Promise<FeedbackRespDto> {
    try {
      const feedbackEntity = Object.assign(new Feedback(), createFeedbackDto);
      const feedback = await this.feedbackRepository
        .create(feedbackEntity)
        .save();
      const resp = FeedbackProcessor.mapEntityToResp(feedback);
      return resp;
    } catch (error) {
      throw error;
    }
  }

  /**
   * This function fetches all feedbacks for a specific USER
   * @param userId
   * @returns
   */
  async findAll(userId: number): Promise<FeedbackListRespDto> {
    try {
      const allFeedback = await this.feedbackRepository
        .createQueryBuilder('feedback')
        .where('feedback.user.id = :id', { id: userId })
        .getMany();

      const resp: FeedbackListRespDto =
        FeedbackProcessor.mapEntityListToResp(allFeedback);

      return resp;
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} feedback`;
  }

  update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    return `This action updates a #${id} feedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} feedback`;
  }
}
