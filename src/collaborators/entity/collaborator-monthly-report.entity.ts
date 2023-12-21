import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../projects/entity/project.entity';
import { Collaborator } from './collaborator.entity';

@Entity({ name: 'tb_collab_monthly_report' })
export class CollaboratorMonthlyReport {
  @PrimaryGeneratedColumn({ name: 'id_collab_monthly_report' })
  id: number;

  @ManyToOne(type => Collaborator)
  @JoinColumn({ name: 'id_collaborator' })
  collaborator: Collaborator;

  @ManyToOne(type => Project)
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @Column({ name: 'ds_activities', type: 'text' })
  activities: string;

  @Column({ name: 'nm_year' })
  year: number;

  @Column({ name: 'nm_month' })
  month: number;

  @Column({ name: 'ds_url', type: 'text' })
  url: string;

  @Column({ name: 'nm_version', default: () => '1' })
  version: number;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: Date;

}