import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DocumentCategory } from './document-category.entity';

@Entity({ name: 'tb_document_type' })
export class DocumentType {
  
  @PrimaryGeneratedColumn({ name: 'id_document_type' })
  id: number;

  @ManyToOne(type => DocumentCategory, {eager: true})
  @JoinColumn({ name: 'id_document_category' })
  documentCategory: DocumentCategory;
  
  @Column({ name: 'ds_name', length: 150 })
  name: string;

  @Column({ name: 'ds_key', length: 150, default: ' ' })
  key: string;

  @Column({ name: 'ds_description', length: 150, nullable: true })
  description: string;

  @Column({ name: 'st_active', default: true})
  active: boolean;

  @Column({ name: 'nm_max_size', type: 'integer', default: 51200, comment: 'Max size for file upload. Default is 50MB (51200 bytes) '})
  maxSize: number;
  
  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}