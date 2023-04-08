import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { SignersModule } from './signers/signers.module';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Contracts, ContractSchema } from './models/contract.schema';
import { ResponseHandler } from '../../src/utils/response.handler';
import { ContractForm, ContractFormSchema } from './models/contract-form.schema';
import { ContractSigners, SignersSchema } from './models/contract-signer.schema';
import { ContractSigns, ContractSignSchema } from './models/contract-signs.schema';
import { Medias, MediaSchema } from './models/media.schema';
import { S3FileUpload } from '../../src/utils/s3';
import { ContractPdf, ContractPdfSchema } from './models/contract-pdf-data.schema';

@Module({
  imports: [
    FilesModule, 
    SignersModule,
    MongooseModule.forFeature([
      {
        name: Contracts.name,
        schema: ContractSchema 
      },
      {
        name: ContractForm.name,
        schema: ContractFormSchema
      },
      {
        name: ContractSigners.name,
        schema: SignersSchema
      },
      {
        name: ContractSigns.name,
        schema: ContractSignSchema
      },
      {
        name: Medias.name,
        schema: MediaSchema 
      },
      {
        name: ContractPdf.name,
        schema: ContractPdfSchema 
      }
    ])
  ],
  controllers: [ContractController],
  providers: [
    ContractService,
    ResponseHandler,
    S3FileUpload
  ]
})
export class ContractModule {}
