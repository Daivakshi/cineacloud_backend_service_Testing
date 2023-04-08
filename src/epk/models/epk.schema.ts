import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type EpkDocument = Epks & Document;

@Schema({ timestamps: true })
export class Epks extends Document {
    @Prop()
    epkName: string

    @Prop()
    width: string

    @Prop()
    height: string

    @Prop({ type: Types.ObjectId, ref: 'userprojects' })
    projectId: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'users' })
    userId: Types.ObjectId

    @Prop({ default: 1 })
    status: number;
}

export const EpkSchema = SchemaFactory.createForClass(Epks);
