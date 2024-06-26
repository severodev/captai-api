import { Injectable, Inject } from '@nestjs/common';
import { Between, FindManyOptions, FindOptionsWhere, In, LessThanOrEqual, Like, Repository } from 'typeorm';
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
        let query = this.editalRepository.createQueryBuilder('entity');
    
        if (filter.agencyList) {
            let lista = filter.agencyList.split(',');
            query = query.andWhere('entity.agency IN (:...lista)', { lista });
        } else if (filter.agency) {
            const searchValue = `%${filter.agency?.toUpperCase()}%`;
            query = query.andWhere('entity.agency ILIKE :searchValue OR entity.title ILIKE :searchValue', { searchValue });
        }
    
        if (filter.areaList) {
            let lista = filter.areaList.split(',').map(item => item.trim());
            query = query.andWhere('entity.areaList IN (:...lista)', { lista });
        }
    
        if (filter.submission) {
            let toDay = new Date();
            toDay.setMinutes(0, 0, 0);
            console.log('toDay ', new Date().setMinutes(0,0))
            query = query.andWhere('entity.dt_submission <= :submission  AND entity.dt_submission >= :toDay', { submission: filter.submission, toDay: toDay });
        }
    
        if (filter.financingValueHigh && filter.financingValueLow) {
            query = query.andWhere('entity.nm_financing_value BETWEEN :low AND :high', {
                low: filter.financingValueLow,
                high: filter.financingValueHigh
            });
        }
    
        if (filter.maturity) {
            query = query.andWhere('entity.maturityLevel LIKE :maturity', { maturity: `%${filter.maturity}%` });
        }

        if (filter.by && filter.order) {
            query = query.orderBy(`entity.${filter.by}`, filter.order.toUpperCase() as 'ASC' | 'DESC');
        }
    
        if (pageOptions.itemsPerPage) {
            query = query.take(pageOptions.itemsPerPage);
        }
    
        return query.getMany();
    }

    async findOne(id: number): Promise<edital> {
        return this.editalRepository.findOne({ where: { id: id } });
    }

}
