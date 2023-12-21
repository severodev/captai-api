import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWPISoftwareLicensesDto {

    @IsString()
    @ApiProperty({ description: 'The software name' })
    softwareName: string;

    @IsInt()
    @ApiProperty({ description: 'The software validity' })
    validity: number;

    @IsInt()
    @ApiProperty({ example: '10'})
    quantity: number;

    @IsString()
    @ApiProperty({ example: '2021-03', description: 'Expected date of purchase' })
    purchaseDate?: string;

}