import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type ElementsDocument = Elements & Document;

class MetaData {
    @Prop()
    value: [];

    @Prop()
    preview: string;
}

@Schema({ timestamps: true })
export class Elements extends Document {
    @Prop({ default: 0 })
    left: number

    @Prop({ default: 0 })
    top: number

    @Prop({ default: 0 })
    width: number

    @Prop({ default: 0 })
    height: number

    @Prop()
    originX: string

    @Prop()
    originY: string

    @Prop({ default: 0 })
    scaleX: number

    @Prop({ default: 0 })
    scaleY: number

    @Prop()
    type: string

    @Prop({ type: MetaData })
    metadata: MetaData

    @Prop({ default: 1 })
    status: number;
}

export const ElementsSchema = SchemaFactory.createForClass(Elements);
