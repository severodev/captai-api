import { Injectable, Inject } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { edital } from '../entity/edital.entity';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';
import { EditalFilter } from '../interfaces/edital.filter';

@Injectable()
export class EditalsService {

    constructor(
        @Inject('EDITAIS_REPOSITORY')
        private editalRepository: Repository<edital>,
    ) { }

    async findAll(filter: EditalFilter, pageOptions : PaginationMetadataDto): Promise<edital[]> {

        const whereClause: any = {};

        if (filter.agency) {
            whereClause.agency = filter.agency;
        }

        if (filter.title) {
            whereClause.title = Like(`%${filter.title}%`);
        }

        if (filter.financingValue) {
            whereClause.financingValue = filter.financingValue;
        }
        let parameters : FindManyOptions<edital> = { 
            where : whereClause,
            order: { title: 'ASC' },
            take: pageOptions.itemsPerPage ? pageOptions.itemsPerPage : 999
        }
        return this.editalRepository.find(parameters);
    }

    async findOne(id: number): Promise<edital> {
        return this.editalRepository.findOne({ where: { id: id } });
    }

}
