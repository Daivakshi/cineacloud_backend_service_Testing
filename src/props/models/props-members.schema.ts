import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema, } from "mongoose";
import { Medias } from "../../contract/models/media.schema";

export type PropsMemberDocument = PropsMember & Document;

@Schema({ timestamps: true })
export class PropsMember extends Document {

    @Prop({ type: String })
    name: string

    @Prop({ type: String })
    email: string

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'userprojects' })
    propId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
    userId: Types.ObjectId

    @Prop({ default: 1 })
    status: number;
}

export const PropsMemberSchema = SchemaFactory.createForClass(PropsMember);
