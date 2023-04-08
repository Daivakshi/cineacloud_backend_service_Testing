import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type ContractPdfDoc = ContractPdf & Document;

@Schema({ timestamps: true })
export class ContractPdf extends Document {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'contracts' })
    contractId: Types.ObjectId

    @Prop({ type: Array, default: [] })
    formData: [];

    @Prop({ default: 1 })
    status: number;
}

export const ContractPdfSchema = SchemaFactory.createForClass(ContractPdf);
