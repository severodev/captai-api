import { Injectable, Inject } from '@nestjs/common';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { Segment } from '../entity/segment.entity';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';
import { SegmentFilter } from '../interfaces/segment.filter';

@Injectable()
export class SegmentService {

    constructor(
        @Inject('SEGMENT_REPOSITORY')
        private segmentRepository: Repository<Segment>,
    ) { }

    async findAll(filter: SegmentFilter, pageOptions : PaginationMetadataDto): Promise<Segment[]> {

        const whereClause: any = {};

        if (filter.id) {
            whereClause.id = filter.id;
        }

        if (filter.neme) {
            whereClause.neme = Like(`%${filter.neme}%`);
        }

        let parameters : FindManyOptions<Segment> = { 
            where : whereClause,
            order: { name: "ASC" },
            take: pageOptions.itemsPerPage ? pageOptions.itemsPerPage : 9999
        }
        return this.segmentRepository.find(parameters);
    }

    async findOne(id: number): Promise<Segment> {
        return this.segmentRepository.findOne({ where: { id: id } });
    }
}
