import { ApiProperty } from '@nestjs/swagger';
import { IsInt} from 'class-validator';

export class PaginationMetadataDto {

    @IsInt()
    @ApiProperty({ example: '10', description: 'The total number of items returned by the database' })
    totalItems?: number;

    @IsInt()
    @ApiProperty({ example: '4', description: 'The number of items to le listed per page' })
    itemsPerPage?: number;

    @IsInt()
    @ApiProperty({ example: '5', description: 'The total number of result pages' })
    totalPages?: number;    

    @IsInt()
    @ApiProperty({ example: '3', description: 'The current page requested by the user' })
    currentPage?: number;
}