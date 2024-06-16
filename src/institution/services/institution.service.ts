import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Institution } from './../entity/institution.entity';

@Injectable()
export class InstitutionService {

    constructor(
        @Inject('INSTITUTION_REPOSITORY')
        private institutionRepository: Repository<Institution>
    ) { }

    async dropdownList(): Promise<Institution[]> {
        return (await this.institutionRepository.find({
            order: {
                name: "ASC"
            }
        })).map(i => <Institution>{
            id: i.id,
            abbreviation: i.abbreviation,
            name: i.name
        });
    }

    async findOne(id: number) : Promise<Institution> {
        return this.institutionRepository.findOne({where : {id}});
    }
}
