import { Types } from "mongoose"
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsObject, ValidateNested, IsNotEmptyObject, IsOptional, IsMongoId } from "class-validator";
import { Prop } from "@nestjs/mongoose";

class StylingObj {
    @IsNotEmpty()
    @IsString()
    font_family: string

    @IsNotEmpty()
    @IsString()
    fill_color: string
}

export class AddSignFontDto {

    @IsString()
    @IsNotEmpty({ message: 'pubKeyFingerprint is required' })
    pubKeyFingerprint: string;

    @IsNotEmptyObject()
    @IsObject({ message: 'Styling is required' })
    @ValidateNested()
    @Type(() => StylingObj)
    styling: StylingObj

    @IsString()
    @IsNotEmpty({ message: 'signatureText is required' })
    signatureText: string

    @IsOptional()
    imageData?: string

    @IsOptional()
    userId?: Types.ObjectId

    @IsOptional()
    signatureId?: Types.ObjectId

};