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

@Injectable()
export class FeedbackService {
  private logger = new Logger('FeedbackService');

  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  /**
   * Pre-requisite: User must be logged in to create feedback(have active session)
   * @param createFeedbackDto
   * @returns
   */
  async create(createFeedbackDto: CreateFeedbackDto) {
    try {
      const feedbackEntity = Object.assign(new Feedback(), createFeedbackDto);
      const feedback = await this.feedbackRepository.save(feedbackEntity);
      return feedback;
    } catch (error) {
      throw new Error(error);
    }
  }

  findAll() {
    try {
      return this.feedbackRepository.find();
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
