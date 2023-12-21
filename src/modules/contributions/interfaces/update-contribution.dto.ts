import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsNumber } from 'class-validator';
import { CreateContributionDto } from './create-contribution.dto';

export class UpdateContributionDto extends PartialType(CreateContributionDto) {

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Amount of contributions received' })
    amount: number;

    @IsNumber()
    @ApiProperty({ example: '5', description: 'Project ID' })
    project: number;

    @IsDate()
    @ApiProperty({ example: new Date(), description: 'Date of receipt of the contribution'})
    receivement: Date;
    
}
