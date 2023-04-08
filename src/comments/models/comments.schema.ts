import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type CommentsDoc = vfx_comments & Document;

class commentResObj {
    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'anonymous' })
    anonymousId: Types.ObjectId

    @Prop()
    comment: string

    @Prop({ type: Date })
    createdAt: Date
}

@Schema({timestamps: true})
export class vfx_comments extends Document {

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'medias' })
    screenId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'props' })
    appId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'vfxvideos' })
    videoId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'vfxs' })
    vfxId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'audioreviews' })
    audioReviewId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'editreviews' })
    editReviewId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'dallies' })
    dalliesId: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    userId: Types.ObjectId

    @Prop({ type: String })
    videoTime: string

    @Prop({ type: String })
    audioTime: string

    @Prop({ type: String })
    seekTime: string

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'anonymous' })
    anonymousId: Types.ObjectId

    @Prop({ type: String })
    canvasObject: string

    @Prop({ type: String })
    comment: string

    @Prop({ type: String })
    type: string

    @Prop({ type: Boolean, default: false })
    markAsComplete: boolean

    @Prop({ type: Array, default: [] })
    commentRes: commentResObj[];

    @Prop({ default: 1 })
    status: number;
}

export const CommentsSchema = SchemaFactory.createForClass(vfx_comments);
