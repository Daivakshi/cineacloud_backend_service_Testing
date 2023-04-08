import { Types } from "mongoose"
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AddDrawSignDto {

    @IsString()
    @IsNotEmpty({ message: 'pubKeyFingerprint is required' })
    image: string;

    @IsOptional()
    userId?: Types.ObjectId

    @IsOptional()
    signatureId?: Types.ObjectId

};