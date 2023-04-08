import { IsString, IsNotEmpty, IsMongoId } from "class-validator";
import { Types } from "mongoose";

export class SubmitSignDto {
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    contractId: Types.ObjectId;
}
