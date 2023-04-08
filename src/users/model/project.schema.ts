import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type ProjectDocument = UserProjects & Document;

@Schema({ timestamps: true })
export class UserProjects extends Document {
    @Prop({ default:1 })
    userPermissionStatus: number

    @Prop()
    projName: string

    @Prop()
    userRole: string

    @Prop({ type: Types.ObjectId, ref: 'users' })
    createdBy: Types.ObjectId

    @Prop({ default: 1 })
    status: number;
}

export const ProjectSchema = SchemaFactory.createForClass(UserProjects);
