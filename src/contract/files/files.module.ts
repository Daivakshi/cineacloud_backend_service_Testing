import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ResponseHandler } from '../../utils/response.handler';
import { MongooseModule } from '@nestjs/mongoose';
import { Medias, MediaSchema } from '../models/media.schema';
import { S3FileUpload } from '../../utils/s3';
import { ContractService } from '../contract.service';
import { Contracts, ContractSchema } from '../models/contract.schema';
import { ContractForm, ContractFormSchema } from '../models/contract-form.schema';
import { ContractSigners, SignersSchema } from '../models/contract-signer.schema';
import { ContractSigns, ContractSignSchema } from '../models/contract-signs.schema';
import { ContractPdf, ContractPdfSchema } from '../models/contract-pdf-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Medias.name,
        schema: MediaSchema 
      },
      {
        name: Contracts.name,
        schema: ContractSchema 
      },
      {
        name: ContractForm.name,
        schema: ContractFormSchema
      },{
        name: ContractSigners.name,
        schema: SignersSchema
      },
      {
        name: ContractSigns.name,
        schema: ContractSignSchema
      },
      {
        name: ContractPdf.name,
        schema: ContractPdfSchema
      }
    ])
  ],
  controllers: [
    FilesController
  ],
  providers: [
    FilesService,
    ResponseHandler,
    S3FileUpload,
    ContractService
  ]
})
export class FilesModule {}
