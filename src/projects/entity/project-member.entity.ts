import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Collaborator } from './../../collaborators/entity/collaborator.entity';
import { Project } from './project.entity';

@Entity({ name: 'tb_project_member' })
export class ProjectMember {
  @PrimaryGeneratedColumn({ name: 'id_project_member' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @Column({ name: 'ds_job_title', length: 200 })
  jobTitle: string;

  @ManyToOne(type => Collaborator, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_collaborator' })
  collaborator: Collaborator;

  @ManyToOne(type => Project)
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

}