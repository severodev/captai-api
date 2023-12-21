import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsNumber } from 'class-validator';
import { CreateLoanDto } from './create-loan.dto';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Amount of loan' })
    amount: number;

    @IsNumber()
    @ApiProperty({ example: '4', description: 'Loan origin project id' })
    originProject: number;

    @IsNumber()
    @ApiProperty({ example: '5', description: 'Loan target project id' })
    targetProject: number;

    @IsDate()
    @ApiProperty({ example: new Date(), description: 'Date of receipt of the loan'})
    receiptDate: Date;

    @IsDate()
    @ApiProperty({ example: new Date(), description: 'Date of return of the loan'})
    returnDate: Date;
}
