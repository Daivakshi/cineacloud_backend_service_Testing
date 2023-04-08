import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type EpkTemplatesDocument = EpkTemplates & Document;
class MetaData {
    @Prop({ type: String })
    src: String
};

class Objects {
    @Prop({ type: Number })
    left: number

    @Prop({ type: Number })
    top: number

    @Prop({ type: Number })
    width: number

    @Prop({ type: Number })
    height: number

    @Prop({ type: String })
    originX: string

    @Prop({ type: String })
    originY: string

    @Prop({ type: Number })
    scaleX: number

    @Prop({ type: Number })
    scaleY: number

    @Prop({ type: String })
    type: string

    @Prop({ type: Object })
    metadata: MetaData

};

class BackgrundObj {
    @Prop({ type: String })
    type: string

    @Prop({ type: String })
    value: string
};

class FrameObj {
    @Prop({ type: Number })
    width: number

    @Prop({ type: Number })
    height: number
};

@Schema({ timestamps: true })
export class EpkTemplates extends Document {
    @Prop()
    name: string

    @Prop({ type: Object })
    background: BackgrundObj

    @Prop({ type: Object })
    frame: FrameObj

    @Prop()
    preview: string

    @Prop({ type: Array, default: [] })
    objects: Objects[];

    @Prop({ type: Types.ObjectId, ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'epks' })
    epkId: Types.ObjectId

    @Prop({ default: 1 })
    status: number;
}

export const EpkTemplatesSchema = SchemaFactory.createForClass(EpkTemplates);
