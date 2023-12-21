import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class WPISoftwareLicensesDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Software Licenses WPI ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

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