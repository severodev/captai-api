import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_institute' })
export class Institute {
  @PrimaryGeneratedColumn({ name: 'id_institute' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'ds_abbreviation', length: 10 })
  abbreviation: string;

  @Column({ name: 'ds_contraktor_abbreviation', length: 15, nullable: true })
  contrakorAbbreviation: string;

  @Column({ name: 'ds_name', length: 255 })
  name: string;

  @Column({ name: 'ds_cnpj', length: 14, nullable: true })
  cnpj: string;

  @Column({ name: 'ds_description', length: 255, nullable: true })
  description: string;

  @Column({ name: 'ds_monthly_report_url', type: 'text', nullable: true })
  monthlyReportUrl: string;

  @Column({ name: 'nm_payment_day', type: 'integer', default: 25 })
  paymentDay: number;
  
  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}