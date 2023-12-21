import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { City } from '../entity/city.entity';
import { State } from '../entity/state.entity';
import { CityDto } from '../interfaces/city.dto';
import { StateDto } from '../interfaces/state.dto';

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
        return await this.cityRepository.findOne(id);
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
        return await this.stateRepository.findOne(id);
    }

}
