import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_hr' })
export class WPIHumanResources {
  @PrimaryGeneratedColumn({ name: 'id_wpi_hr' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiHR, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_job_title', length: 200 })
  jobTitle: string;

  @Column({ name: 'ds_education_level', length: 100 })
  educationLevel: string;

  @Column({ name: 'nm_working_hours' })
  workingHours: number;

}