import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserFileService } from '../files/user-files.service';
import { UserRepository } from './user.repository';
import { Favourite } from '../favourite/entities/favourite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Favourite])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserFileService],
})
export class UserModule {}
