import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_document_category' })
export class DocumentCategory {
  @PrimaryGeneratedColumn({ name: 'id_document_category' })
  id: number;
  
  @Column({ name: 'ds_name', length: 150 })
  name: string;

  @Column({ name: 'ds_directory', length: 250, nullable: true })
  directory: string;
  
  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}