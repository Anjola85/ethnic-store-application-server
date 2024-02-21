import {
  FeedbackListRespDto,
  FeedbackRespDto,
} from 'src/contract/version1/response/feedback-response.dto';
import { Feedback } from './entities/feedback.entity';

export class FeedbackProcessor {
  public static mapEntityToResp(feedback: Feedback): FeedbackRespDto {
    const resp: FeedbackRespDto = {
      id: feedback.id,
      content: feedback.content,
      rating: feedback.rating,
      createdAt: feedback.createdAt,
    };
    return resp;
  }

  public static mapEntityListToResp(
    feedbacks: Feedback[],
  ): FeedbackListRespDto {
    const feedbackList = feedbacks.map((feedback) =>
      this.mapEntityToResp(feedback),
    );
    const payload: FeedbackListRespDto = {
      feedbackList: feedbackList,
      size: feedbackList.length,
    };
    return payload;
  }
}
