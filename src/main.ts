import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port: number = parseInt(process.env.PORT);
  const accessKeyId: string = process.env.AWS_S3_ACCESS_KEY;
  const secretAccessKey: string = process.env.AWS_S3_SECRET_KEY;
  const region: string = process.env.AWS_S3_REGION;

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));

  app.useStaticAssets(join(__dirname, '..', 'public/templates/assets'), {prefix: '/images'});
  app.useStaticAssets(join(__dirname, '..', 'public'), {prefix: '/templates'});
  app.setViewEngine('ejs');

  app.use(morgan('dev'));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));

  morgan.token('body', function getId(req, res) {
    return JSON.stringify(req.body)
  })
  morgan.token('json', function getId(req, res) {
    return JSON.stringify(res.__morgan_body_response)
  })

  let accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' })

  // log all requests to access.log
  app.use(morgan(':method :url :body :status :json :response-time ms ', {
    stream: accessLogStream
  }))

  config.update({
    accessKeyId,
    secretAccessKey,
    region,
  });

  const options = new DocumentBuilder()
    .setTitle('Cineacloud App')
    .setDescription(`Suite for cine field App`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}
bootstrap();
