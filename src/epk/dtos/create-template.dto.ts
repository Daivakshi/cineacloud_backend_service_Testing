import { Types } from "mongoose"
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsObject, ValidateNested, IsNotEmptyObject, IsOptional, IsMongoId, IsArray, ArrayNotEmpty, IsBoolean, IsNumber } from "class-validator";
import { Prop } from "@nestjs/mongoose";

class MetaData {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    src?: string
};

class BackgroundObj {
    @IsNotEmpty()
    @IsString()
    type: string

    @IsNotEmpty()
    @IsString()
    value: string
};

class FrameObj {
    @IsNotEmpty()
    @IsNumber()
    width: number

    @IsNotEmpty()
    @IsNumber()
    height: string
};

class ObjectData {
    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    left?: number

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    top?: number

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    width?: number

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    height?: number

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    originX?: string

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    originY?: string

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    scaleX?: number

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    scaleY?: number

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    type?: string

    @IsOptional()
    @IsNotEmptyObject()
    @IsObject({ message: 'MetaData is required' })
    @ValidateNested()
    @Type(() => MetaData)
    metadata?: MetaData
}

export class CreateTemplateDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ObjectData)
    objects?: ObjectData

    @IsNotEmptyObject()
    @IsObject({ message: 'BackgroundObj is required' })
    @ValidateNested()
    @Type(() => BackgroundObj)
    background: BackgroundObj

    @IsNotEmptyObject()
    @IsObject({ message: 'FrameObj is required' })
    @ValidateNested()
    @Type(() => FrameObj)
    frame: FrameObj

    @IsOptional()
    @IsString()
    preview?: string

    @IsOptional()
    userId?: Types.ObjectId

    epkId?: Types.ObjectId

    @IsOptional()
    templateId?: Types.ObjectId

};