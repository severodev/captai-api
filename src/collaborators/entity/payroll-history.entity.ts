import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institute } from '../../institutes/entity/institute.entity';
import { Project } from '../../projects/entity/project.entity';
import { BudgetCategory } from '../../suppliers/entity/budget-category.entity';
import { Collaborator } from './collaborator.entity';
import { EmploymentRelationship } from './employment-relationship.entity';

@Entity({ name: 'tb_payroll_history' })
export class PayRollHistory {
  @PrimaryGeneratedColumn({ name: 'id_payroll_history' })
  id: number;

  @ManyToOne(type => Collaborator, collaborator => collaborator.payroll, { nullable: false })
  @JoinColumn({ name: 'id_collaborator' })
  collaborator: Collaborator;
  
  @ManyToOne(type => Project, { nullable: false })
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @ManyToOne(type => EmploymentRelationship, { nullable: false })
  @JoinColumn({ name: 'id_employment_relationship' })
  employmentRelationship: EmploymentRelationship;

  @ManyToOne(type => Institute, { nullable: false })
  @JoinColumn({ name: 'id_institute' })
  institute: Institute;

  @ManyToOne(type => BudgetCategory, { nullable: true })
  @JoinColumn({ name: 'id_budget_category' })
  budgetCategory: BudgetCategory;

  @Column({ name: 'ds_benefits_list', type: 'text' })
  benefitsList: string;

  @Column({ name: 'ds_job_title', length: 150 })
  jobTitle: string;

  @Column({ name: 'dt_admission', type: 'date' })
  admission: Date;

  @Column({ name: 'dt_dismissal', type: 'date', nullable: true })
  dismissal: Date;

  @Column({ name: 'ds_description', length: 250, nullable: true })
  description: string;

  @Column({ name: 'nm_salary', type: 'float' })
  salary: number;

  @Column({ name: 'nm_workload', nullable: true })
  workload: number;

  @Column({ name: 'st_professor_relationship', type: 'bool', default: false })
  isProfessorRelationship: boolean;

  @Column({ name: 'nm_version' })
  version: number;

  @Column({ name: 'ds_reason', type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

}