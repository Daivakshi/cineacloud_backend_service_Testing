import { Types } from 'mongoose'
import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsMongoId, IsObject, ValidateNested, IsDateString, IsOptional, IsArray, IsBoolean, IsNumber } from "class-validator";
import * as moment from "moment";

export class AddMembersDto {

    @IsString()
    @IsNotEmpty({ message: 'epkId is required' })
    @IsMongoId()
    epkId: string;

    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'userId is required' })
    @IsMongoId()
    createdBy: Types.ObjectId;

};