import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { EmploymentRelationship } from '../entity/employment-relationship.entity';
import { EmploymentRelationshipDropdownDto } from '../interfaces/employment-relationship-dropdown.dto';

@Injectable()
export class EmploymentRelationshipService {
  constructor(
    @Inject('EMPLOYMENT_RELATIONSHIP_REPOSITORY')
    private erRepository: Repository<EmploymentRelationship>
  ) { }

  async dropdown(): Promise<EmploymentRelationshipDropdownDto[]> {
    const filters: FindManyOptions<EmploymentRelationship> = {
      order: {
        id: "ASC"
      }
    };
    return (await this.erRepository.find(filters))
      .map(p => <EmploymentRelationshipDropdownDto>{
        id: p.id,
        name: p.name
      });
  }

  async findOne(id: number): Promise<EmploymentRelationship> {
    return await this.erRepository.findOne({ where: { id: id }, relations: ['benefits']});
  }

}