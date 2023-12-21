import { User } from '../../users/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tb_audit_entry' })
export class AuditEntry {
  @PrimaryGeneratedColumn({ name: 'id_audit_entry', type: 'int8' })
  id: number;
  
  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @Column({ name: 'ds_action_type', length: 20 })
  actionType: string;

  @Column({ name: 'ds_action_description', length: 250, nullable: true })
  actionDescription: string;

  @Column({ name: 'ds_target_table', length: 100, default: '' })
  targetTable: string;
  
  @Column({ name: 'ds_target_entity', length: 100 })
  targetEntity: string;
  
  @Column({ name: 'id_target_entity', type: 'integer', nullable: true})
  targetEntityId: number;

  @Column({ name: 'ds_target_entity_body', type: 'text', nullable: true })
  targetEntityBody: string;

  @Column({ name: 'ds_error_type', length: 250, nullable: true })
  errorType: string;
  
  @Column({ name: 'ds_error_description', type: 'text', nullable: true })
  errorDescription: string;

}