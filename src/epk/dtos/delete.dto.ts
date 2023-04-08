import { IsMongoId, IsString } from "class-validator";
import { Types } from "mongoose";

export class DeleteDto {
    @IsMongoId()
    @IsString({ message: "Epk is mandatory" })
    epkId: Types.ObjectId;
}