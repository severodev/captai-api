import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BenefitGrant } from './benefit-grant.entity';

@Entity({ name: 'tb_benefit_type' })
export class BenefitType {

  @PrimaryGeneratedColumn({ name: 'id_benefit_type' })
  id: number;
  
  @OneToMany(type => BenefitGrant, grant => grant.benefitType, { cascade: true })
  @JoinColumn()
  grants: BenefitGrant[];

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'st_custom', type: 'bool', default: false })
  custom: boolean;

  @Column({ name: 'ds_code', length: 80, nullable: true })
  code: string;

  @Column({ name: 'ds_name', length: 150 })
  name: string;

  @Column({ name: 'ds_description', length: 250, nullable: true })
  description: string;
  
  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}