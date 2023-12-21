import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class ProfileDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Profile ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'ADMIN', description: 'Profile key' })
    key: string;

    @IsString()
    @ApiProperty({ example: 'Administrador', description: 'Profile title' })
    title: string;

    @IsString()
    @ApiProperty({ example: 'Administrador do CaptIA', description: 'Profile description' })
    description: string;

}