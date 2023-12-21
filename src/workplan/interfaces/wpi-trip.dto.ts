import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsInt, IsString } from "class-validator";

export class WPITripDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Trip WPI Details Item ID' })
    id: number;

    @IsInt()
    @ApiProperty({ example: '7', description: 'Workplan Item ID' })
    workplanItemId: number;

    @IsString()
    @ApiProperty({ description: 'The name of the event requiring a trip' })
    event: string;

    @IsString()
    @ApiProperty({ description: 'The itinerary of the trip' })
    itinerary: string;

    @IsString()
    @ApiProperty({ example: 'Lidiane Castro', description: 'The name of the collaborator travelling for project demands' })
    passengerName?: string;

    @IsString()
    @ApiProperty({ example: '189.234.877-01', description: 'The CPF document of the collaborator travelling for project demands' })
    passengerCpf?: string;

    // @IsDecimal()
    // @ApiProperty({ example: 'R$ 950,00', description: 'Airplane/bus ticket price' })
    // ticketValue?: number;

    // @IsDecimal()
    // @ApiProperty({ example: 'R$ 1.200,00', description: 'Airplane/bus ticket price' })
    // hostingValue?: number;

    // @IsDecimal()
    // @ApiProperty({ example: 'R$ 70,00', description: 'Daily allowance for taxi, food and emergencies' })
    // dailyAllowanceValue?: number;
    
    @IsString()
    @ApiProperty({ example: '2021-03-01', description: 'Trip start date' })
    start?: string;

    // @IsString()
    // @ApiProperty({ example: '2021-03-20', description: 'Trip end date' })
    // end?: string;

    @IsInt()
    @ApiProperty({ example: '3', description: 'Duration of the trip in days' })
    days: number;

    @IsInt()
    @ApiProperty({ example: '2', description: 'Amount of people travelling' })
    quantity: number;

}