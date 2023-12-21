import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_training' })
export class WPITraining {
  @PrimaryGeneratedColumn({ name: 'id_wpi_training' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiTraining, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_title', type: 'text' })
  title: string;
  
  @Column({ name: 'ds_instructor_name', length: 200, nullable: true })
  instructorName?: string;

  @Column({ name: 'ds_cnpj', length: 20, nullable: true })
  cnpj?: string;

  // @Column({ name: 'ds_education_level', length: 100 })
  // educationLevel: string;

  @Column({ name: 'dt_start', type: 'date', nullable: true})
  start?: Date;

  @Column({ name: 'dt_end', type: 'date', nullable: true})
  end?: Date;

}