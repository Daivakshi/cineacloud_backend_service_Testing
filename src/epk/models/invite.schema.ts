import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose";

export type InviteMembersDocs = InviteMembers & Document;

@Schema({timestamps: true})
export class InviteMembers extends Document {
    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'users' })
    createdBy: Types.ObjectId

    @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'contracts' })
    epkId: Types.ObjectId

    @Prop({ type: Boolean, default: false })
    emailsent: boolean

    @Prop({ default: 1 })
    status: number;
}

export const InviteMembersSchema = SchemaFactory.createForClass(InviteMembers);
