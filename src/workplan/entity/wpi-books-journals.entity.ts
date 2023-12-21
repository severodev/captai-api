import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Supplier } from '../../suppliers/entity/supplier.entity';
import { WorkplanItem } from './workplan-item.entity';

@Entity({ name: 'tb_wpi_books_journals' })
export class WPIBooksJournals {

  @PrimaryGeneratedColumn({ name: 'id_wpi_books_journals' })
  id: number;

  @OneToMany(type => WorkplanItem, workplanItem => workplanItem.wpiBooksJournals, { nullable: false })
  @JoinColumn({ name: 'id_workplan_item' })
  workplanItem: WorkplanItem;

  @Column({ name: 'ds_work_title', length: 200, nullable: true })
  workTitle: string;

  @Column({ name: 'nm_quantity', type: 'integer', nullable: true })
  quantity: number;

}