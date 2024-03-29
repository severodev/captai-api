import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_editais' })
export class edital {

  @PrimaryGeneratedColumn({ name: 'id_edital' })
  id: number;

  @Column({ name: 'ds_link_pdf', nullable: true })
  link: string;

  @Column({ name: 'ds_agency', nullable: true })
  agency: string;

  @Column({ name: 'ds_title', nullable: true })
  title: string;

  @Column({ name: 'ds_objective', nullable: true })
  objective: string;

  @Column({ name: 'ds_elegibility', nullable: true })
  elegibility: string;

  @Column({ name: 'ds_submission', nullable: true })
  submission: string;

  @Column({ name: 'ds_financing_value', nullable: true })
  financingValue: string;

  @Column({ name: 'ds_area_list', nullable: true })
  areaList: string;

  @Column({ name: 'dt_created_at', type: 'timestamp', nullable: true })
  created: number;
} 