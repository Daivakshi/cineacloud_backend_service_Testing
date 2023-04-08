import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema, } from "mongoose";
import { Medias } from "../../contract/models/media.schema";

export type NotificationsDocument = Notifications & Document;

@Schema({ timestamps: true })
export class Notifications extends Document {

    @Prop({ type: String, enum: ['onScreenComment', 'generalNotification', 'projectNotification', 'vfxNotification'] })
    notificationType: string

    @Prop({ type: Boolean, default: false })
    isSeen: boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'userprojects' })
    projectId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'vfxs' })
    vfxId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
    createdUser: Types.ObjectId

    @Prop({ type: String })
    message: string

    @Prop({ default: 1 })
    status: number;
}

export const NotificationsSchema = SchemaFactory.createForClass(Notifications);