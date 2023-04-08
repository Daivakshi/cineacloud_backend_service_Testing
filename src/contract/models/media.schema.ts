import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type MediaDocument = Medias & Document;

@Schema({timestamps: true})
export class Medias extends Document {
    @Prop()
    fileName: string;

    @Prop()
    mimeType: string;

    @Prop()
    key: string;

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'contracts' })
    contractId: Types.ObjectId

    @Prop()
    fileId: string;

    @Prop()
    sequence: number;

    @Prop({ type: String })
    type: string

    @Prop({ type: Boolean, default: false })
    conversionStatus: boolean;

    @Prop({ default: 1 })
    status: number;
}

export const MediaSchema = SchemaFactory.createForClass(Medias);
