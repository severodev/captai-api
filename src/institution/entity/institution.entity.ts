import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_institution' })
export class Institution {
  @PrimaryGeneratedColumn({ name: 'id_institution' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'ds_abbreviation', length: 10 })
  abbreviation: string;

  @Column({ name: 'ds_name', length: 255 })
  name: string;

  @Column({ name: 'ds_cnpj', length: 14, nullable: true })
  cnpj: string;

  @Column({ name: 'ds_description', length: 255, nullable: true })
  description: string;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}