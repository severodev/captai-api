import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Country } from './country.entity';

@Entity({ name: 'tb_state' })
export class State {

  @PrimaryGeneratedColumn({ name: 'id_state' })
  id: number;

  @Column({ name: 'ds_abbreviation', length: 4 })
  abbreviation: string;

  @Column({ name: 'ds_name', length: 150 })
  name: string;

  @ManyToOne(type => Country)
  @JoinColumn({ name: 'id_country' })
  country: Country;

}