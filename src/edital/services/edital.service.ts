import { Injectable, Inject } from '@nestjs/common';
import { Between, FindManyOptions, FindOptionsWhere, In, LessThanOrEqual, Like, Repository } from 'typeorm';
import { Edital } from '../entity/edital.entity';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';
import { EditalFilter } from '../interfaces/edital.filter';
import moment from 'moment';
import { Logger } from 'winston';

@Injectable()
export class EditalsService {

    constructor(
        @Inject('EDITAIS_REPOSITORY')
        private editalRepository: Repository<Edital>,
        @Inject('winston')
        private readonly logger: Logger,
    ) { }

    async findAll(filter: EditalFilter, pageOptions: PaginationMetadataDto): Promise<Edital[]> {

        try {

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
                let startDate = filter.submission;
                let endDate = new Date().setHours(24, 59, 59).toString();
                // let toDay = new Date();
                // toDay.setHours(24, 59, 59);
                // console.log('toDay ', new Date().setMinutes(0,0))
                query = query.andWhere('entity.dt_submission >= :startDate', { startDate });
            }

            if (filter.financingValueHigh && filter.financingValueLow) {
                query = query.andWhere('(entity.nm_financing_value IS NULL OR entity.nm_financing_value BETWEEN :low AND :high)', {
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
        } catch (err) {
            // console.error(error);
            this.logger.error(
                'Problema na consulta de editais',
                err,
              );
        }
    }

    async findOne(id: number): Promise<Edital> {
        return this.editalRepository.findOne({ where: { id: id } });
    }

}
