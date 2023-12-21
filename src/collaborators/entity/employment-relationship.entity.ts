import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Benefit } from './benefit.entity';

@Entity({ name: 'tb_employment_relationship' })
export class EmploymentRelationship {
  @PrimaryGeneratedColumn({ name: 'id_employment_relationship' })
  id: number;

  @Column({ name: 'ds_code', length: 30, nullable: true })
  code: string;
  
  @Column({ name: 'ds_name', length: 150 })
  name: string;

  @ManyToMany(type => Benefit, { cascade: true })
  @JoinTable({
    name: 'tb_er_benefits',
    joinColumn: { name: 'tb_employment_relationship' },
    inverseJoinColumn: { name: 'id_benefit' }
  })
  benefits: Benefit[];

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}