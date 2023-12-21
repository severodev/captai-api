import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_validity' })
export class Validity {

  @PrimaryGeneratedColumn({ name: 'id_validity' })
  id: number;

  @Column({ name: 'ds_name', type: 'text' })
  name: string;

}