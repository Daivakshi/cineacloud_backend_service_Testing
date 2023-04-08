import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema, } from "mongoose";
import { Medias } from "../../contract/models/media.schema";

export type PropsDocument = Props & Document;

@Schema({ timestamps: true })
export class Props extends Document {
    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'medias' }]
    })
    image: Medias[]

    @Prop({ type: String })
    item: string

    @Prop({ type: Number })
    sceneNumber: number

    @Prop({ type: String })
    sceneHeading: string

    @Prop({ type: String })
    cast: string

    @Prop({ type: String })
    notes: string

    @Prop({ type: Boolean, default: false })
    approved: boolean

    @Prop({ type: Boolean, default: false })
    acquired: boolean

    @Prop({ type: Date })
    shootDate: Date

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'userprojects' })
    projectId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'scripts' })
    scriptId: Types.ObjectId

    @Prop({ type: String })
    script_sceneId: string

    @Prop({ default: 1 })
    status: number;
}

export const PropsSchema = SchemaFactory.createForClass(Props);
