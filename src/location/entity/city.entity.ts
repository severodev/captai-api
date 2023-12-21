import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { State } from "./state.entity";

@Entity({ name: 'tb_city' })
export class City {

  @PrimaryGeneratedColumn({ name: 'id_city' })
  id: number;

  @Column({ name: 'ds_name', length: 150 })
  name: string;

  @ManyToOne(type => State)
  @JoinColumn({ name: 'id_state' })
  state: State;

}