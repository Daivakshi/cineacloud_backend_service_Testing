import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mailer } from '../../utils/mailService';
import { ResponseHandler } from '../../utils/response.handler';
import { ContractSigners, SignersSchema } from '../models/contract-signer.schema';
import { ContractSigns, ContractSignSchema } from '../models/contract-signs.schema';
import { Contracts, ContractSchema } from '../models/contract.schema';
import { SignersController } from './signers.controller';
import { SignersService } from './signers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContractSigners.name,
        schema: SignersSchema
      },
      {
        name: Contracts.name,
        schema: ContractSchema 
      },
      {
        name: ContractSigns.name,
        schema: ContractSignSchema
      }
    ])
  ],
  controllers: [
    SignersController
  ],
  providers: [
    SignersService,
    ResponseHandler,
    Mailer
  ]
})
export class SignersModule { }
