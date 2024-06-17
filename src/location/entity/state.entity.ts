import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Country } from './country.entity';
import { User } from 'src/users/entity/user.entity';

@Entity({ name: 'tb_state' })
export class State {

  @PrimaryGeneratedColumn({ name: 'id_state' })
  id: number;

  @Column({ name: 'ds_abbreviation', length: 4 })
  abbreviation: string;

  @Column({ name: 'ds_name', length: 150 })
  name: string;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @ManyToOne(type => Country, { eager: false })
  @JoinColumn({ name: 'id_country' })
  country: Country;

  @ManyToMany(() => User, user => user.abrangency)
  User: User[];
}