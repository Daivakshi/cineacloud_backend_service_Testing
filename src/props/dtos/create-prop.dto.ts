import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsNumber, IsArray, IsDefined, ValidateNested, ArrayNotEmpty, IsObject, IsNotEmptyObject, IsBoolean, IsDate, IsDateString } from "class-validator";
import { Document, Types, Schema as MongooseSchema } from "mongoose";
import * as moment from "moment";
import { Medias } from "../../contract/models/media.schema";
export class CreatePropsDto {

    @IsArray()
    @IsOptional()
    @IsMongoId({ each: true})
    image?: Medias[];

    @IsString()
    @IsNotEmpty()
    item: string

    @IsNumber()
    @IsOptional()
    sceneNumber?: number

    @IsString()
    @IsOptional()
    sceneHeading?: string

    @IsString()
    @IsOptional()
    cast?: string

    @IsString()
    @IsOptional()
    notes?: string

    @IsOptional()
    @Transform(({ value }) => value ? moment(new Date(value)).format() : '')
    @IsDateString()
    shootDate?: Date

    @IsBoolean()
    @IsOptional()
    approved?: boolean

    @IsBoolean()
    @IsOptional()
    acquired?: boolean

    @IsOptional()
    @IsString()
    userId?: Types.ObjectId

    @IsOptional()
    @IsString()
    projectId?: Types.ObjectId

    @IsOptional()
    @IsString()
    scriptId?: Types.ObjectId

    @IsOptional()
    @IsString()
    script_sceneId?: Types.ObjectId

    @IsOptional()
    @IsString()
    propsId?: Types.ObjectId

}