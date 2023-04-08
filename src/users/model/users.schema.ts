import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UsersDocument = User & Document;

class SocialLogin {
    @Prop()
    id: string

    @Prop()
    token: string

    @Prop()
    name: string

    @Prop()
    emails: string
};
@Schema()
export class User extends Document {
    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop()
    company: string;

    @Prop({
        required: true,
        unique: true
    })
    email: string

    @Prop()
    password: string;

    @Prop({ type: Object })
    facebook: SocialLogin

    @Prop({ type: Object })
    google: SocialLogin

    @Prop({ type: Boolean, default: false })
    isVerified: boolean;

    @Prop({
        type: String,
    })
    verificationtoken: string;

    @Prop({
        type: Number,
        required: true,
        default: 0,
    })
    loginAttempts: number;

    @Prop({
        type: Array,
        default: [],
    })
    projects: [];

    @Prop({
        type: String,
    })
    activeProjectId: string;

    @Prop({
        type: Date,
        default: Date.now,
    })
    date: number;

    @Prop({
        type: String,
    })
    stripeCustId: string;

    @Prop({
        type: String,
    })
    stripeSubId: string;

    @Prop({
        type: Boolean,
        default: false
    })
    status: boolean;

    @Prop({
        type: String,
    })
    onboardingToken: string;

    @Prop({
        type: String,
    })
    plan: string;

    @Prop({
        type: String,
    })
    planLabel: string;

    @Prop({
        type: String,
    })
    planSpace: string;

    @Prop({
        type: String,
    })
    trialDescription: string;

    @Prop({
        type: String,
    })
    planId: string;

    @Prop({
        type: Boolean,
        default: false
    })
    isCouponApplied: boolean;

    @Prop({
        type: Object
    })
    userMeta: object;

    @Prop({
        type: Object
    })
    companyInfo: object;

    @Prop({
        type: String,
        default: 'user'
    })
    role: string;

    @Prop({
        type: Boolean,
        default: false
    })
    isFestivalManager: boolean;

    @Prop({
        type: Date
    })
    lastLoggedIn: number;

    @Prop({
        type: String
    })
    authKey: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);


