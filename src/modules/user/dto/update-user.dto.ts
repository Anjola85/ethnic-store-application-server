import { PartialType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';

export class UpdateUserDto extends PartialType(UserDto) {
  // changing password is different, this DTO cannot include that
}
