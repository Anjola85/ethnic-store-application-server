export interface FeedbackRespDto {
  id: number;
  content: string;
  rating: number;
  createdAt: number;
}

export interface FeedbackListRespDto {
  feedbackList: FeedbackRespDto[];
  size: number;
}
