import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type InviteSignersDocs = ContractSigners & Document;

@Schema({timestamps: true})
export class ContractSigners extends Document {
    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    action: string;

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    createdBy: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'contracts' })
    contractId: Types.ObjectId

    @Prop({ type: Date })
    signedDate: Date;

    @Prop({ type: Number, default: 1 }) //1- not opened 2-document viewed 3-document signed 0- declined
    documentStatus: number

    @Prop({ type: Boolean, default: false })
    emailsent: boolean

    @Prop({ type: Boolean, default: false })
    isAgreed: boolean

    @Prop({ type: Object })
    emailData: object

    @Prop()
    token: string

    @Prop({ default: 1 })
    status: number;
}

export const SignersSchema = SchemaFactory.createForClass(ContractSigners);
