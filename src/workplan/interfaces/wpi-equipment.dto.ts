import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class WPIEquipmentDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Equipment WPI ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

    @IsString()
    @ApiProperty({ example: 'Impressora Sala Admin', description: 'The equipment name' })
    equipmentName: string;

    @IsString()
    @ApiProperty({ example: 'Impressora', description: 'The equipment type' })
    equipmentType: string;

    @IsString()
    @ApiProperty({ example: 'Brother MFC-L2740', description: 'The equipment model' })
    equipmentModel: string;

    @IsInt()
    @ApiProperty({ example: '10'})
    quantity: number;

    @IsString()
    @ApiProperty({ example: '2021-03', description: 'Expected date of purchase' })
    purchaseDate?: string;

}