import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeleteUserDto {
  @IsString()
  @IsOptional()
  userId: number;

  @IsString()
  @IsOptional()
  deleteReason: string;

  @IsString()
  @IsOptional()
  deleteComment: string;

  @IsString()
  @IsNotEmpty()
  deletedAt: number;

  constructor(user: DeleteUserDto, userId?: number) {
    this.userId = userId;
    this.deleteReason = user.deleteReason;
    this.deleteComment = user.deleteComment;
    this.deletedAt = user.deletedAt;
  }
}
