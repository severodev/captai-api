import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_noted_date' })
export class NotedDate {
  @PrimaryGeneratedColumn({ name: 'id_noted_date' })
  id: number;

  @Column({ name: 'ds_type', length: 80 })
  type: string;

//   INSERT INTO public.tb_noted_date
// (id_noted_date, dt_noted_date, st_part_time, ds_title, ds_description)
// VALUES(1, '2021-03-26', false, 'Data Magna', 'Feriado movido da quinta-feira (25/03) para sexta-feira (26/03).');


  @Column({ name: 'dt_noted_date', type: 'date' })
  notedDate: Date;
  
  @Column({ name: 'st_part_time', type: 'bool', default: false })
  partTime: boolean;  

  @Column({ name: 'ds_title', length: 150 })
  title: string;

  @Column({ name: 'ds_description', length: 250, nullable: true })
  description: string;

}