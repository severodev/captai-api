import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsEmail, IsBoolean, IsArray, IsInt } from "class-validator";

export class UpdateUserEditalListDto {

    @IsInt()
    @ApiProperty({ example: 'userId', description: 'User ID' })
    userId: number;

    @IsInt()
    @ApiProperty({ example: 'editalId', description: 'Edital ID' })
    editalId: number;

    @IsBoolean()
    @ApiProperty({ example: 'true', description: 'True flag means edital removal. False means edital addition' })
    remove: boolean;

}