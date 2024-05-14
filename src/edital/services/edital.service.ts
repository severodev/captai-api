import { Injectable, Inject } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere, In, Like, Repository } from 'typeorm';
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

        if (filter.agencyList) {
            let lista = filter.agencyList.split(',');
            whereClause.agency = In(lista);
        } else {
            if (filter.agency) {
                whereClause.agency = Like(`%${filter.agency.toLocaleUpperCase()}%`);
            }
        }

        if (filter.areaList) {
            let lista = filter.areaList.split(',').map(item => item.trim());
            whereClause.areaList = In(lista);
        }

        if (filter.submission) {
            whereClause.submission = Like(`%${filter.submission}%`);
        }

        if (filter.financingValue) {
            whereClause.financingValue = filter.financingValue;
        }

        if (filter.maturity) {
            whereClause.maturityLevel = Like(`%${filter.maturity}%`);
        }
        let orderClause: {[key: string]: string} = {};

        if (filter.by && filter.order) {
            orderClause[filter.by] = filter.order;
        } 

        let parameters : FindManyOptions<edital> = { 
            where : whereClause,
            order: orderClause,
            take: pageOptions.itemsPerPage ? pageOptions.itemsPerPage : 9999
        }
        return this.editalRepository.find(parameters);
    }

    async findOne(id: number): Promise<edital> {
        return this.editalRepository.findOne({ where: { id: id } });
    }

}
