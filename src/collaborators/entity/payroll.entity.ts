import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Institute } from '../../institutes/entity/institute.entity';
import { BudgetCategory } from '../../suppliers/entity/budget-category.entity';
import { Project } from './../../projects/entity/project.entity';
import { Benefit } from './benefit.entity';
import { Collaborator } from './collaborator.entity';
import { EmploymentRelationship } from './employment-relationship.entity';
import { Payment } from './payment.entity';

@Entity({ name: 'tb_payroll' })
export class PayRoll {
  @PrimaryGeneratedColumn({ name: 'id_payroll' })
  id: number;

  @Column({ name: 'st_active', type: 'bool', default: true })
  active: boolean;

  @ManyToOne(type => Collaborator, collaborator => collaborator.payroll, { nullable: false })
  @JoinColumn({ name: 'id_collaborator' })
  collaborator: Collaborator;
  
  @ManyToOne(type => Project, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @ManyToOne(type => EmploymentRelationship, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_employment_relationship' })
  employmentRelationship: EmploymentRelationship;

  @ManyToOne(type => Institute, { nullable: false, eager: true })
  @JoinColumn({ name: 'id_institute' })
  institute: Institute;

  @ManyToOne(type => BudgetCategory, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_budget_category' })
  budgetCategory: BudgetCategory;

  @ManyToMany(type => Benefit, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinTable({
    name: 'tb_payroll_benefits',
    joinColumn: { name: 'id_payroll' },
    inverseJoinColumn: { name: 'id_benefit' }    
  })
  benefits: Benefit[];

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

  @OneToMany(type => Payment, payment => payment.payroll, { cascade: ['insert','update','remove'] })
  @JoinColumn()
  payments: Payment[];

  @Column({ name: 'nm_version', default: 1 })
  version: number;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: Date;

}