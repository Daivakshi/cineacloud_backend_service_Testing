import { Types } from "mongoose"
import { IsString, IsNotEmpty, IsOptional, IsMongoId } from "class-validator";

export class DiscordContractDto {
    @IsMongoId()
    contractId: Types.ObjectId
};