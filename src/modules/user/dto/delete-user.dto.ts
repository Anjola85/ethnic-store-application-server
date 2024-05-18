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
}
