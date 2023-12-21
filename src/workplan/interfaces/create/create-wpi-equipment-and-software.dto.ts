import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWPIEquipmentAndSoftwareDto {

    @IsString()
    @ApiProperty({ example: 'Impressora Sala Admin', description: 'The item name' })
    itemName: string;

    @IsString()
    @ApiProperty({ example: 'Impressora', description: 'The item type' })
    itemType: string;

    @IsString()
    @ApiProperty({ example: 'Brother MFC-L2740', description: 'The equipment model' })
    equipmentModel: string;

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