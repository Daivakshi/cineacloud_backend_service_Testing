import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from './model/users.schema';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { ErrorHandler } from '../../src/utils/error.handler';
import { ResponseHandler } from '../../src/utils/response.handler';
import { ProjectSchema, UserProjects } from './model/project.schema';
import { Mailer } from '../../src/utils/mailService';
import { PremiumUsers, PremiumUserSchema } from './model/premium-user.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema
      },
      {
        name: PremiumUsers.name,
        schema: PremiumUserSchema
      },
      {
        name: UserProjects.name,
        schema: ProjectSchema
      }
    ])
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersService,
    AuthService,
    ErrorHandler,
    ResponseHandler,
    Mailer    
  ],
  exports:[
    AuthService,
    ErrorHandler
  ]
})
export class UsersModule { }
