import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type SignsDocument = ContractSigns & Document;

class StylingObj {
    @Prop()
    font_family: string

    @Prop()
    fill_color: string
}

@Schema({timestamps: true})
export class ContractSigns extends Document {
    @Prop()
    imageData: string;

    @Prop()
    pubKeyFingerprint: string;

    @Prop()
    signatureText: string;

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    userId: Types.ObjectId 

    @Prop({ type: Object, default: {} })
    styling: StylingObj
    
    @Prop({ default: 1 })
    status: number;
}

export const ContractSignSchema = SchemaFactory.createForClass(ContractSigns);