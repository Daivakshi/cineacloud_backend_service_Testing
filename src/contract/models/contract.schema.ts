import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type ContractDocument = Contracts & Document;

@Schema({timestamps: true})
export class Contracts extends Document {
    @Prop({ default: '' })
    name: string;

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'projects' })
    projectId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    userId: Types.ObjectId

    @Prop({ default: false })
    isSingleSigner: boolean

    @Prop({ type: Number, default: 1 }) //1- not opened 2-document created 3-document viewed 4-document signed
    documentStatus: number

    @Prop({ default: 1 })
    status: number;
}

export const ContractSchema = SchemaFactory.createForClass(Contracts);
