import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'tb_country' })
export class Country {

  @PrimaryGeneratedColumn({ name: 'id_country' })
  id: number;

  @Column({ name: 'ds_abbreviation', length: 4 })
  abbreviation: string;

  @Column({ name: 'ds_name', length: 150 })
  name: string;

}