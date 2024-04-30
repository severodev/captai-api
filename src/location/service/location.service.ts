import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, In, Like, Repository } from 'typeorm';
import { City } from '../entity/city.entity';
import { State } from '../entity/state.entity';
import { CityDto } from '../interfaces/city.dto';
import { StateDto } from '../interfaces/state.dto';
import { SegmentFilter } from 'src/segment/interfaces/segment.filter';
import { StateFilter } from '../interfaces/stateFilter';
import { PaginationMetadataDto } from 'src/util/interfaces/pagination-metadata.dto';

@Injectable()
export class LocationService {

    constructor(
        @Inject('CITY_REPOSITORY')
        private cityRepository: Repository<City>,
        @Inject('STATE_REPOSITORY')
        private stateRepository: Repository<State>
    ) { }

    async cityDropdown(state: number): Promise<CityDto[]> {
        const filters: FindManyOptions<City> = {
            order: {
                name: "ASC"
            },
            relations: ["state", "state.country"]
        };
        if (state && state > 0) {
            filters.where = {
                state: {
                    id: state
                }
            };
        }
        return (await this.cityRepository.find(filters))
            .map(c => <CityDto>{
                id: c.id,
                name: c.name,
                state: c.state.abbreviation,
                country: c.state.country.abbreviation
            });
    }

    async findCity(id: number): Promise<City> {
        return await this.cityRepository.findOne({ where: {id}});
    }

    async stateDropdown(country: number): Promise<StateDto[]> {
        const filters: FindManyOptions<State> = {
            order: {
                abbreviation: "ASC"
            },
            relations: ["country"]
        };
        if (country && country > 0) {
            filters.where = {
                country: {
                    id: country
                }
            };
        }
        return (await this.stateRepository.find(filters))
            .map(s => <StateDto>{
                id: s.id,
                abbreviation: s.abbreviation,
                name: s.name,
                country: s.country.abbreviation
            });
    }

    async findState(id: number): Promise<State> {
        return await this.stateRepository.findOne({ where: {id}});
    }

    /////// new content for captai ////////

    async findAllStates(filter: StateFilter, pageOptions : PaginationMetadataDto): Promise<State[]> {

        const whereClause: any = {};

        if (filter.ids) {
            whereClause.id = In(filter.ids);
        }

        if (filter.name) {
            whereClause.neme = Like(`%${filter.name}%`);
        }

        if (filter.abbreviation) {
            whereClause.abbreviation = Like(`%${filter.abbreviation}%`);
        }

        let parameters : FindManyOptions<State> = { 
            where : whereClause,
            order: { name: "ASC" },
            take: pageOptions.itemsPerPage ? pageOptions.itemsPerPage : 9999
        }

        return this.stateRepository.find(parameters);
    }
}
