import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institute } from '../../institutes/entity/institute.entity';
import { BenefitType } from './benefit-type.entity';
import { EmploymentRelationship } from './employment-relationship.entity';

@Entity({ name: 'tb_benefit_grant' })
export class BenefitGrant {

  @PrimaryGeneratedColumn({ name: 'id_benefit_grant' })
  id: number;

  @ManyToOne(type => BenefitType, {nullable: true} )
  @JoinColumn({ name: 'id_benefit_type' })
  benefitType: BenefitType;

  @ManyToOne(type => Institute, {nullable: true} )
  @JoinColumn({ name: 'id_institute' })
  institute: Institute;

  @ManyToOne(type => EmploymentRelationship, {nullable: true} )
  @JoinColumn({ name: 'id_employment_relationship' })
  employmentRelationship: EmploymentRelationship;
  
}