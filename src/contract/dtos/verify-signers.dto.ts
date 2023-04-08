import { IsString, IsNotEmpty, IsMongoId } from "class-validator";
import { Types } from "mongoose";

export class VerifySignersDto {
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    contractId: Types.ObjectId;

    @IsString()
    @IsNotEmpty({ message: "Token is mandatory" })
    token: string
}
