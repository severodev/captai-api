import { Injectable, Inject } from '@nestjs/common';
import { FindManyOptions, In, Like, Repository } from 'typeorm';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';
import { ActiviteFilter } from '../interfaces/activite.filter';
import { Activite } from '../entity/Activite.entity';

@Injectable()
export class ActivitesService {

    constructor(
        @Inject('ACTIVITE_REPOSITORY')
        private activiteRepository: Repository<Activite>,
    ) { }

    async findAll(filter: ActiviteFilter, pageOptions : PaginationMetadataDto): Promise<Activite[]> {

        const whereClause: any = {};

        if (filter.ids) {
            whereClause.id = In(filter.ids);
        }

        if (filter.name) {
            whereClause.name = Like(`%${filter.name}%`);
        }

        let orderClause: {[key: string]: string} = {};

        if (filter.by && filter.order) {
            orderClause[filter.by] = filter.order;
        } 

        let parameters : FindManyOptions<Activite> = { 
            where : whereClause,
            order: orderClause,
            take: pageOptions.itemsPerPage ? pageOptions.itemsPerPage : 9999
        }
        return this.activiteRepository.find(parameters);
    }

    async findOne(id: number): Promise<Activite> {
        return this.activiteRepository.findOne({ where: { id: id } });
    }
}
