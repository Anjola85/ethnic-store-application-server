import { IsNotEmpty, IsString } from 'class-validator';
import { LimitWordCount } from 'src/common/validation/decorator/limit-word-count.decorator';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  @LimitWordCount(100)
  content: string;

  @IsNotEmpty()
  @IsString()
  user: User[];
}
