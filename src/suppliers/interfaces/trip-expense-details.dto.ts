import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsInt, IsString } from "class-validator";

export class TripExpenseDetailsDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Trip Expese Details ID' })
    id?: number;

    @IsString()
    @ApiProperty({ example: 'Lidiane Castro', description: 'The name of the collaborator travelling for project demands' })
    passengerName: string;

    @IsString()
    @ApiProperty({ example: '189.234.877-01', description: 'The CPF document of the collaborator travelling for project demands' })
    passengerCpf: string;

    @IsDecimal()
    @ApiProperty({ example: 'R$ 950,00', description: 'Airplane/bus ticket price' })
    ticketValue: number;

    @IsDecimal()
    @ApiProperty({ example: 'R$ 1.200,00', description: 'Airplane/bus ticket price' })
    hostingValue: number;

    @IsDecimal()
    @ApiProperty({ example: 'R$ 70,00', description: 'Daily allowance for taxi, food and emergencies' })
    dailyAllowanceValue: number;

}