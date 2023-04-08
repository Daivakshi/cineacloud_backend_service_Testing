import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type ContractFormDoc = ContractForm & Document;

class Bbox {
    @Prop()
    aspectRatio: number
    
    @Prop()
    height: number

    @Prop()
    initial: boolean

    @Prop()
    left: number

    @Prop()
    page: number

    @Prop()
    top: number

    @Prop()
    width: number

    @Prop()
    widthPct: number

    @Prop()
    x: number

    @Prop()
    y: number
}

class formDataObj {
    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'contractsigners' })
    signatoryId: Types.ObjectId

    @Prop()
    type: string

    @Prop({ type: Object })
    bbox: Bbox

    @Prop()
    hideSourceOnDrag: boolean

    @Prop()
    placeholder: string

    @Prop({ type: String })
    textData: string

    @Prop({ type: String })
    signatureText: string

    @Prop({ type: Object })
    fontData: object

    @Prop({ type: String })
    imageData: string

    @Prop()
    id: string
}

@Schema({timestamps: true})
export class ContractForm extends Document {

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'contracts' })
    contractId: Types.ObjectId

    @Prop({ type: Array, default: [] })
    formData: formDataObj[];

    @Prop({ default: 1 })
    status: number;
}

export const ContractFormSchema = SchemaFactory.createForClass(ContractForm);
