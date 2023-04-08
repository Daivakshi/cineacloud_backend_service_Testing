import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CurrentUserMiddleware } from './Middelwares/current-user.middleware';
import { ContractModule } from './contract/contract.module';
import { User, UsersSchema } from './users/model/users.schema';
import { ContractSigners, SignersSchema } from './contract/models/contract-signer.schema';
import { EpkModule } from './epk/epk.module';
import { PropsModule } from './props/props.module';
import { MediasModule } from './medias/medias.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_URI'),
        dbName: configService.get<string>('DB_NAME'),
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        autoIndex: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema
      },
      {
        name: ContractSigners.name,
        schema: SignersSchema
      }
    ]),
    UsersModule,
    ContractModule,
    EpkModule,
    PropsModule,
    MediasModule,
    CommentsModule,
    NotificationModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware)
      .exclude(
        { path: '/', method: RequestMethod.GET },
        { path: 'users/signin', method: RequestMethod.POST },
        { path: 'users/signup', method: RequestMethod.POST },
        { path: 'epk/elements', method: RequestMethod.GET },
        { path: 'epk/download', method: RequestMethod.GET },
        { path: 'public/templates/assets/logo.png', method: RequestMethod.GET },
        { path: 'epk/elements', method: RequestMethod.POST },
        { path: 'signs/verify', method: RequestMethod.POST },
        { path: 'users/login', method: RequestMethod.POST },
        { path: 'users/extend-session', method: RequestMethod.GET },
        { path: 'users/add-premium-user', method: RequestMethod.POST },
        { path: 'contract/conversion-status', method: RequestMethod.POST },
        { path: 'contract/file-status', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
