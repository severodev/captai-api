import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_editais' })
export class Edital {

  @PrimaryGeneratedColumn({ name: 'id_edital' })
  id: number;

  @Column({ name: 'ds_link_pdf', nullable: true })
  link: string;

  @Column({ name: 'ds_agency', nullable: true })
  agency: string;

  @Column({ name: 'ds_title', nullable: true })
  title: string;

  @Column({ name: 'ds_full_title', nullable: true })
  fullTitle: string;

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

  @Column({ name: 'ds_edital_number', nullable: true })
  editalNumber: string;

  @Column({ name: 'ds_trl_level', nullable: true })
  maturityLevel: string;

  @Column({ name: 'dt_file_date', type: 'timestamp', nullable: true })
  fileDate: number;

  @Column({ name: 'nm_file_version', nullable: true })
  fileVersion: number;

  @Column({ name: 'dt_submission', type: 'timestamp', nullable: true })
  dt_submission: Date;

  @Column({ name: 'ds_currency', nullable: true })
  ds_currency: string;

  @Column({ name: 'nm_financing_value', nullable: true })
  nm_financing_value: number;
} 