import { IsString, IsNotEmpty, IsMongoId } from "class-validator";
import { Types } from "mongoose";

export class ViewContractParamDto {
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    contractId: Types.ObjectId;
}
