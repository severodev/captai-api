import { Injectable, Inject } from '@nestjs/common';
import { Institute } from './../entity/institute.entity';
import { Repository } from 'typeorm';
import { InstituteDropdownDto } from './../interfaces/institute-dropdown-dto';

@Injectable()
export class InstitutesService {

    constructor(
        @Inject('INSTITUTE_REPOSITORY')
        private instituteRepository: Repository<Institute>        
    ) { }

    async dropdownList(): Promise<InstituteDropdownDto[]> {
        return (await this.instituteRepository.find({
            order: {
                name: "ASC"
            }
        })).map(i => <InstituteDropdownDto>{
            id: i.id,
            abbreviation: i.abbreviation,
            name: i.name
        });
    }

    async findOne(id: number) : Promise<Institute> {
        return this.instituteRepository.findOne({where : {id}});
    }
}
