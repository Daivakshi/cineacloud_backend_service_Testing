import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type PremiumUserDocument = PremiumUsers & Document;

@Schema({ timestamps: true })
export class PremiumUsers extends Document {
    @Prop({ type: String, required: true })
    email: string

    @Prop({ type: String })
    verificationtoken: string

    @Prop({ type: Date })
    addedDate: number

    @Prop({ type: Date })
    verficationDate: number

    @Prop({ type: Types.ObjectId, ref: 'users' })
    createdBy: Types.ObjectId

    @Prop({ default: 1 })
    status: number;
}

export const PremiumUserSchema = SchemaFactory.createForClass(PremiumUsers);