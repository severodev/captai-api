import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmploymentRelationship } from './employment-relationship.entity';

@Entity({ name: 'tb_irrf_rule' })
export class IRRFRule {
  @PrimaryGeneratedColumn({ name: 'id_irrf_rule' })
  id: number;

  @ManyToOne(type => EmploymentRelationship)
  @JoinColumn({ name: 'id_employment_relationship' })
  employmentRelationship: EmploymentRelationship;

  @Column({ name: 'ds_name', length: 100 })
  name: string;

  @Column({ name: 'nm_lower_limit', type: 'float'})
  lowerLimit: number;

  @Column({ name: 'nm_upper_limit', type: 'float'})
  upperLimit: number;

  @Column({ name: 'nm_quota', type: 'float' })
  quota: number; 

  @Column({ name: 'nm_deduction', type: 'float' })
  deduction: number; 

}