import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseHandler } from '../../src/utils/response.handler';
import { EpkElementsModule } from './epk-elements/epk-elements.module';
import { EpkController } from './epk.controller';
import { EpkService } from './epk.service';
import { Epks, EpkSchema } from './models/epk.schema';
import { EpkTemplatesController } from './epk-templates/epk-templates.controller';
import { EpkTemplatesService } from './epk-templates/epk-templates.service';
import { EpkTemplates, EpkTemplatesSchema } from './models/epk-template.schema';
import { InviteMembers, InviteMembersSchema } from './models/invite.schema';
import { S3FileUpload } from '../../src/utils/s3';
import { Mailer } from '../../src/utils/mailService';

@Module({
    imports: [
        EpkElementsModule,
        MongooseModule.forFeature([
            {
                name: Epks.name,
                schema: EpkSchema
            },
            {
                name: EpkTemplates.name,
                schema: EpkTemplatesSchema
            },
            {
                name: InviteMembers.name,
                schema: InviteMembersSchema
            }
        ])
    ],
    controllers: [
        EpkController,
        EpkTemplatesController
    ],
    providers: [
        EpkService,
        ResponseHandler,
        EpkTemplatesService,
        S3FileUpload,
        Mailer
    ],
})
export class EpkModule { }
