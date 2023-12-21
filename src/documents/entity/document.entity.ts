import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FileType } from './file-type.entity';
import { DocumentType } from "./document-type.entity";

@Entity({ name: 'tb_document' })
export class Document {

  constructor(_id?: number) {
    if (_id) {
      this.id = _id;
    }
  }

  @PrimaryGeneratedColumn({ name: 'id_document' })
  id: number;

  @ManyToOne(type => DocumentType, { eager: true })
  @JoinColumn({ name: 'id_document_type' })
  documentType: DocumentType;

  @ManyToOne(type => FileType, { eager: true })
  @JoinColumn({ name: 'id_file_type' })
  fileType: FileType;

  @Column({ name: 'ds_file_name', length: 250 })
  filename: string;

  @Column({ name: 'ds_url', type: 'text' })
  url: string;

  @Column({ name: 'ds_notes', length: 300, nullable: true })
  notes: string;

  @Column({ name: 'nm_size', type: 'float', nullable: true })
  size: number;

  @Column({ name: 'nm_version', default: 1 })
  version: number;

  @Column({ name: 'st_deleted', default: false })
  deleted: boolean;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}