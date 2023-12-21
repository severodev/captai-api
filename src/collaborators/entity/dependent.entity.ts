import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Collaborator } from './collaborator.entity';
import { Document } from '../../documents/entity/document.entity';

@Entity({ name: 'tb_dependent' })
export class Dependent {
  @PrimaryGeneratedColumn({ name: 'id_dependent' })
  id: number;

  @Column({ name: 'ds_name', length: 200 })
  name: string;

  @Column({ name: 'ds_relationship', length: 100 })
  relationship: string;

  @Column({ name: 'dt_birth', type: 'date' })
  birthDate: Date;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: Date;

  @ManyToOne(type => Collaborator, collaborator => collaborator.dependents)
  @JoinColumn({ name: 'id_collaborator' })
  collaborator: Collaborator;

  @ManyToMany(type => Document, {cascade: true})
  @JoinTable({
    name: 'tb_dependent_documents',
    joinColumn: { name: 'id_dependent' },
    inverseJoinColumn: { name: 'id_document' }
  })
  documents: Document[];

}