import { Controller, Get, UseFilters, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';
import { SegmentFilter } from '../interfaces/segment.filter';
import { SegmentService } from '../services/segment.service';


@ApiTags('Segment')
@Controller('segment')
@UseFilters(AllExceptionsFilter)
export class SegmentController {

    constructor(private readonly segmentService: SegmentService) { }

    @Get()
    findAll(@Query() filter: SegmentFilter, @Query() pageOptions: PaginationMetadataDto): any {
        return this.segmentService.findAll(filter, pageOptions);
    }

    @Get(':segmentId')
    findById(@Param('segmentId') segmentId : number): any {
        return this.segmentService.findOne(segmentId);
    }
}